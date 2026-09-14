import { desc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { useDb } from '../../db/client'
import { transfers, wallets } from '../../db/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const fromWallet = alias(wallets, 'from_wallet')
  const toWallet = alias(wallets, 'to_wallet')

  return db
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
    .orderBy(desc(transfers.date), desc(transfers.id))
})
