import { desc, eq, sql } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { idolExpenses, wallets } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  const baseQuery = () =>
    db
      .select({
        id: idolExpenses.id,
        category: idolExpenses.category,
        amount: idolExpenses.amount,
        note: idolExpenses.note,
        date: idolExpenses.date,
        paymentMethod: idolExpenses.paymentMethod,
        walletId: idolExpenses.walletId,
        createdAt: idolExpenses.createdAt,
        walletName: wallets.name
      })
      .from(idolExpenses)
      .leftJoin(wallets, eq(idolExpenses.walletId, wallets.id))
      .orderBy(desc(idolExpenses.date), desc(idolExpenses.id))

  if (!query.page) {
    return baseQuery()
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20))

  const [items, [{ count }]] = await Promise.all([
    baseQuery()
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(idolExpenses)
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
