import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'

const bodySchema = z.object({
  walletId: z.number().int().optional(),
  categoryId: z.number().int().optional(),
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().int().positive().optional(),
  note: z.string().max(200).optional(),
  date: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [transaction] = await db.update(transactions).set(body).where(eq(transactions.id, id)).returning()
  if (!transaction) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  }
  return transaction
})
