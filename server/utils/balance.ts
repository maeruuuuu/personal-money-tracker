import { and, eq, like, sql } from 'drizzle-orm'
import { useDb } from '../db/client'
import { wallets, transactions, transfers, idolExpenses, idolTopups } from '../db/schema'

interface WalletLike {
  id: number
  initialBalance: number
}

interface TransactionLike {
  walletId: number
  type: 'income' | 'expense' | 'correction'
  amount: number
}

interface TransferLike {
  fromWalletId: number
  toWalletId: number
  amount: number
}

interface IdolWalletExpenseLike {
  walletId: number | null
  amount: number
}

export function computeWalletBalance(
  wallet: WalletLike,
  allTransactions: TransactionLike[],
  allTransfers: TransferLike[],
  idolWalletExpenses: IdolWalletExpenseLike[] = []
) {
  let balance = wallet.initialBalance

  for (const tx of allTransactions) {
    if (tx.walletId !== wallet.id) continue
    if (tx.type === 'income') balance += tx.amount
    else if (tx.type === 'expense') balance -= tx.amount
    else balance += tx.amount
  }

  for (const tr of allTransfers) {
    if (tr.fromWalletId === wallet.id) balance -= tr.amount
    if (tr.toWalletId === wallet.id) balance += tr.amount
  }

  for (const ie of idolWalletExpenses) {
    if (ie.walletId === wallet.id) balance -= ie.amount
  }

  return balance
}

export async function getWalletsWithBalance() {
  const db = useDb()

  const [allWallets, allTransactions, allTransfers, allIdolWalletExpenses] = await Promise.all([
    db.select().from(wallets),
    db.select().from(transactions),
    db.select().from(transfers),
    db
      .select({ walletId: idolExpenses.walletId, amount: idolExpenses.amount })
      .from(idolExpenses)
      .where(eq(idolExpenses.paymentMethod, 'wallet'))
  ])

  return allWallets
    .map((wallet) => ({
      ...wallet,
      balance: computeWalletBalance(wallet, allTransactions, allTransfers, allIdolWalletExpenses)
    }))
    .sort((a, b) => Number(a.status === 'inactive') - Number(b.status === 'inactive'))
}

export async function getWalletBalance(walletId: number) {
  const wallets = await getWalletsWithBalance()
  return wallets.find((w) => w.id === walletId)?.balance ?? 0
}

export async function getSummary() {
  const db = useDb()

  const [[{ totalIncome }], [{ totalExpense }], [{ correctionSum }], [{ initialSum }], [{ idolWalletExpenseSum }]] =
    await Promise.all([
      db
        .select({ totalIncome: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(eq(transactions.type, 'income')),
      db
        .select({ totalExpense: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(eq(transactions.type, 'expense')),
      db
        .select({ correctionSum: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(eq(transactions.type, 'correction')),
      db.select({ initialSum: sql<number>`coalesce(sum(${wallets.initialBalance}), 0)` }).from(wallets),
      db
        .select({ idolWalletExpenseSum: sql<number>`coalesce(sum(${idolExpenses.amount}), 0)` })
        .from(idolExpenses)
        .where(eq(idolExpenses.paymentMethod, 'wallet'))
    ])

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    totalBalance:
      Number(initialSum) +
      Number(totalIncome) -
      Number(totalExpense) +
      Number(correctionSum) -
      Number(idolWalletExpenseSum)
  }
}

export async function getIdolPointBalance() {
  const db = useDb()

  const [[{ topupSum }], [{ pointExpenseSum }]] = await Promise.all([
    db.select({ topupSum: sql<number>`coalesce(sum(${idolTopups.amount}), 0)` }).from(idolTopups),
    db
      .select({ pointExpenseSum: sql<number>`coalesce(sum(${idolExpenses.amount}), 0)` })
      .from(idolExpenses)
      .where(eq(idolExpenses.paymentMethod, 'point'))
  ])

  return Number(topupSum) - Number(pointExpenseSum)
}

export async function getIdolExpenseSummary() {
  const db = useDb()

  const [{ totalExpense }] = await db
    .select({ totalExpense: sql<number>`coalesce(sum(${idolExpenses.amount}), 0)` })
    .from(idolExpenses)

  return { totalExpense: Number(totalExpense) }
}

export async function getMonthlySummary(month: string) {
  const db = useDb()

  const [[{ totalIncome }], [{ totalExpense }]] = await Promise.all([
    db
      .select({ totalIncome: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.type, 'income'), like(transactions.date, `${month}-%`))),
    db
      .select({ totalExpense: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.type, 'expense'), like(transactions.date, `${month}-%`)))
  ])

  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    net: Number(totalIncome) - Number(totalExpense)
  }
}
