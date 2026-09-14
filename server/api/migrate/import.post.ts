import { useDb } from '../../db/client'
import { wallets, categories, transactions, transfers } from '../../db/schema'
import { buildMigrationPlan } from '../../utils/csvMigration'

const CHUNK_SIZE = 100

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export default defineEventHandler(async () => {
  const plan = await buildMigrationPlan()
  const db = useDb()

  const result = await db.transaction(async (tx) => {
    if (plan.newWallets.length > 0) {
      await tx.insert(wallets).values(plan.newWallets.map((name) => ({ name, type: 'other' as const })))
    }
    if (plan.newCategories.length > 0) {
      await tx.insert(categories).values(plan.newCategories)
    }

    const [allWallets, allCategories] = await Promise.all([
      tx.select().from(wallets),
      tx.select().from(categories)
    ])

    const walletIdByName = new Map(allWallets.map((w) => [w.name.trim().toLowerCase(), w.id]))
    const categoryIdByKey = new Map(
      allCategories.map((c) => [`${c.name.trim().toLowerCase()}::${c.type}`, c.id])
    )

    function resolveWalletId(name: string) {
      const id = walletIdByName.get(name.trim().toLowerCase())
      if (!id) throw new Error(`Wallet tidak ditemukan: "${name}"`)
      return id
    }

    function resolveCategoryId(name: string, type: 'income' | 'expense') {
      const id = categoryIdByKey.get(`${name.trim().toLowerCase()}::${type}`)
      if (!id) throw new Error(`Kategori tidak ditemukan: "${name}" (${type})`)
      return id
    }

    const sortedTransactions = [...plan.transactions].sort((a, b) => a.sortKey - b.sortKey)
    const sortedTransfers = [...plan.transfers].sort((a, b) => a.sortKey - b.sortKey)

    for (const batch of chunk(sortedTransactions, CHUNK_SIZE)) {
      await tx.insert(transactions).values(
        batch.map((t) => ({
          walletId: resolveWalletId(t.walletName),
          categoryId: resolveCategoryId(t.categoryName, t.type),
          type: t.type,
          amount: t.amount,
          note: t.note,
          date: t.date
        }))
      )
    }

    for (const batch of chunk(sortedTransfers, CHUNK_SIZE)) {
      await tx.insert(transfers).values(
        batch.map((t) => ({
          fromWalletId: resolveWalletId(t.fromWalletName),
          toWalletId: resolveWalletId(t.toWalletName),
          amount: t.amount,
          note: t.note,
          date: t.date
        }))
      )
    }

    return {
      walletsCreated: plan.newWallets.length,
      categoriesCreated: plan.newCategories.length,
      transactionsInserted: sortedTransactions.length,
      transfersInserted: sortedTransfers.length
    }
  })

  return result
})
