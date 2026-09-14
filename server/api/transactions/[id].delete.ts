import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [transaction] = await db.delete(transactions).where(eq(transactions.id, id)).returning()
  if (!transaction) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  }
  return { success: true }
})
