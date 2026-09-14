import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { useDb } from '../db/client'
import { wallets, categories } from '../db/schema'

const MIGRATE_DIR = join(process.cwd(), 'migrate')
const TRANSFER_CATEGORY_PLACEHOLDER = '-'

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((f) => f.trim() !== '')) rows.push(row)
  }

  return rows
}

export async function listMigrationFiles(): Promise<string[]> {
  try {
    const entries = await readdir(MIGRATE_DIR)
    return entries.filter((f) => f.toLowerCase().endsWith('.csv')).sort()
  } catch {
    return []
  }
}

export async function readMigrationRows(): Promise<string[][]> {
  const files = await listMigrationFiles()
  const allRows: string[][] = []

  for (const file of files) {
    const text = await readFile(join(MIGRATE_DIR, file), 'utf-8')
    const rows = parseCsv(text)
    allRows.push(...rows.slice(1))
  }

  return allRows
}

export function parseDateTime(raw: string): { dateStr: string; sortKey: number } {
  const match = raw
    .trim()
    .match(/^(\w{3})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (!match) {
    throw new Error(`Format tanggal tidak dikenali: "${raw}"`)
  }

  const [, monStr, dayStr, yearStr, hourStr, minStr, period] = match
  const month = MONTHS[monStr as keyof typeof MONTHS]
  if (month === undefined) {
    throw new Error(`Nama bulan tidak dikenali: "${monStr}"`)
  }

  const day = Number(dayStr)
  const year = Number(yearStr)
  let hour = Number(hourStr) % 12
  if (period.toUpperCase() === 'PM') hour += 12
  const minute = Number(minStr)

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const sortKey = ((((year * 12 + month) * 31 + day) * 24 + hour) * 60) + minute

  return { dateStr, sortKey }
}

export function roundAmount(raw: string): number {
  return Math.round(Number(raw) * 100) / 100
}

export interface TransactionDraft {
  type: 'income' | 'expense'
  walletName: string
  categoryName: string
  amount: number
  note: string
  date: string
  sortKey: number
}

export interface TransferDraft {
  fromWalletName: string
  toWalletName: string
  amount: number
  note: string
  date: string
  sortKey: number
}

export function transformRows(rawRows: string[][]) {
  const transactions: TransactionDraft[] = []
  const transfers: TransferDraft[] = []

  for (const row of rawRows) {
    const [time, type, amountRaw, categoryRaw, account, notesRaw] = row
    if (!time || !type) continue

    const { dateStr, sortKey } = parseDateTime(time)
    const amount = roundAmount(amountRaw)
    const note = (notesRaw ?? '').trim()

    if (type.includes('Transfer')) {
      const [fromWalletName, toWalletName] = account.split('->').map((s) => s.trim())
      if (!fromWalletName || !toWalletName) {
        throw new Error(`Format akun transfer tidak dikenali: "${account}"`)
      }
      transfers.push({ fromWalletName, toWalletName, amount, note, date: dateStr, sortKey })
      continue
    }

    const category = categoryRaw.trim()
    if (category === TRANSFER_CATEGORY_PLACEHOLDER) continue

    const txType = type.includes('Income') ? 'income' : 'expense'
    transactions.push({
      type: txType,
      walletName: account.trim(),
      categoryName: category,
      amount,
      note,
      date: dateStr,
      sortKey
    })
  }

  return { transactions, transfers }
}

export interface MigrationPlan {
  files: string[]
  newWallets: string[]
  newCategories: { name: string; type: 'income' | 'expense' }[]
  transactions: TransactionDraft[]
  transfers: TransferDraft[]
  totals: { income: number; expense: number; transferAmount: number }
  dateRange: [string, string] | null
}

export async function buildMigrationPlan(): Promise<MigrationPlan> {
  const files = await listMigrationFiles()
  const rawRows = await readMigrationRows()
  const { transactions, transfers } = transformRows(rawRows)

  const db = useDb()
  const [existingWallets, existingCategories] = await Promise.all([
    db.select().from(wallets),
    db.select().from(categories)
  ])

  const existingWalletNames = new Set(existingWallets.map((w) => w.name.trim().toLowerCase()))
  const existingCategoryKeys = new Set(
    existingCategories.map((c) => `${c.name.trim().toLowerCase()}::${c.type}`)
  )

  const neededWalletNames = new Set<string>()
  for (const tx of transactions) neededWalletNames.add(tx.walletName)
  for (const tr of transfers) {
    neededWalletNames.add(tr.fromWalletName)
    neededWalletNames.add(tr.toWalletName)
  }

  const newWallets = [...neededWalletNames]
    .filter((name) => !existingWalletNames.has(name.trim().toLowerCase()))
    .sort()

  const neededCategories = new Map<string, { name: string; type: 'income' | 'expense' }>()
  for (const tx of transactions) {
    const key = `${tx.categoryName.trim().toLowerCase()}::${tx.type}`
    if (!neededCategories.has(key)) neededCategories.set(key, { name: tx.categoryName, type: tx.type })
  }

  const newCategories = [...neededCategories.entries()]
    .filter(([key]) => !existingCategoryKeys.has(key))
    .map(([, v]) => v)
    .sort((a, b) => a.name.localeCompare(b.name))

  const totals = { income: 0, expense: 0, transferAmount: 0 }
  for (const tx of transactions) {
    if (tx.type === 'income') totals.income += tx.amount
    else totals.expense += tx.amount
  }
  for (const tr of transfers) totals.transferAmount += tr.amount

  const allDates = [...transactions.map((t) => t.date), ...transfers.map((t) => t.date)].sort()
  const dateRange: [string, string] | null =
    allDates.length > 0 ? [allDates[0], allDates[allDates.length - 1]] : null

  return { files, newWallets, newCategories, transactions, transfers, totals, dateRange }
}
