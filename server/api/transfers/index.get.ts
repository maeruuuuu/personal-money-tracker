import { desc, eq, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { useDb } from '../../db/client'
import { transfers, wallets } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()
  const fromWallet = alias(wallets, 'from_wallet')
  const toWallet = alias(wallets, 'to_wallet')

  const walletId = query.walletId ? Number(query.walletId) : undefined
  const whereClause = walletId
    ? or(eq(transfers.fromWalletId, walletId), eq(transfers.toWalletId, walletId))
    : undefined

  const baseQuery = () =>
    db
      .select({
        id: transfers.id,
        fromWalletId: transfers.fromWalletId,
        toWalletId: transfers.toWalletId,
        amount: transfers.amount,
        note: transfers.note,
        date: transfers.date,
        createdAt: transfers.createdAt,
        fromWalletName: fromWallet.name,
        toWalletName: toWallet.name
      })
      .from(transfers)
      .innerJoin(fromWallet, eq(transfers.fromWalletId, fromWallet.id))
      .innerJoin(toWallet, eq(transfers.toWalletId, toWallet.id))
      .where(whereClause)
      .orderBy(desc(transfers.date), desc(transfers.id))

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
      .from(transfers)
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
