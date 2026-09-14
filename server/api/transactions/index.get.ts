import { and, desc, eq, sql } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, wallets, categories } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  const walletId = query.walletId ? Number(query.walletId) : undefined
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const conditions = [
    walletId ? eq(transactions.walletId, walletId) : undefined,
    categoryId ? eq(transactions.categoryId, categoryId) : undefined
  ].filter((c) => c !== undefined)
  const whereClause = conditions.length ? and(...conditions) : undefined

  const baseQuery = () =>
    db
      .select({
        id: transactions.id,
        walletId: transactions.walletId,
        categoryId: transactions.categoryId,
        type: transactions.type,
        amount: transactions.amount,
        note: transactions.note,
        date: transactions.date,
        createdAt: transactions.createdAt,
        walletName: wallets.name,
        categoryName: categories.name,
        categoryColor: categories.color
      })
      .from(transactions)
      .innerJoin(wallets, eq(transactions.walletId, wallets.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(transactions.date), desc(transactions.id))

  if (!query.page) {
    return baseQuery()
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20))

  const [items, [{ count }]] = await Promise.all([
    baseQuery()
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(whereClause)
  ])

  const total = Number(count)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  }
})
