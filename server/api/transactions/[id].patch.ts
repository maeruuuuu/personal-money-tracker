import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'

const bodySchema = z
  .object({
    walletId: z.number().int().optional(),
    categoryId: z.number().int().nullable().optional(),
    type: z.enum(['income', 'expense', 'correction']).optional(),
    amount: z.number().optional(),
    note: z.string().max(200).optional(),
    date: z.string().min(1).optional()
  })
  .refine((data) => data.type !== 'correction' || data.amount === undefined || data.amount !== 0, {
    message: 'Selisih koreksi tidak boleh 0'
  })
  .refine((data) => data.type === 'correction' || data.amount === undefined || data.amount > 0, {
    message: 'Jumlah harus lebih dari 0'
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
