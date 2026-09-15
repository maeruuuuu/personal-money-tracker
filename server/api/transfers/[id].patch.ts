import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transfers } from '../../db/schema'

const bodySchema = z
  .object({
    fromWalletId: z.number().int().optional(),
    toWalletId: z.number().int().optional(),
    amount: z.number().positive().optional(),
    note: z.string().max(200).optional(),
    date: z.string().min(1).optional()
  })
  .refine((data) => data.fromWalletId === undefined || data.toWalletId === undefined || data.fromWalletId !== data.toWalletId, {
    message: 'Wallet asal dan tujuan tidak boleh sama'
  })

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [transfer] = await db.update(transfers).set(body).where(eq(transfers.id, id)).returning()
  if (!transfer) {
    throw createError({ statusCode: 404, statusMessage: 'Transfer tidak ditemukan' })
  }
  return transfer
})
