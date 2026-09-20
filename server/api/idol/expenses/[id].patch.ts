import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { idolExpenses } from '../../../db/schema'

const bodySchema = z
  .object({
    category: z.enum(['2S', 'MnG', 'VC', 'Rulet', 'Theater']).optional(),
    amount: z.number().positive().optional(),
    note: z.string().max(200).optional(),
    date: z.string().min(1).optional(),
    paymentMethod: z.enum(['point', 'wallet']).optional(),
    walletId: z.number().int().nullable().optional()
  })
  .refine(
    (data) =>
      data.paymentMethod === undefined || (data.paymentMethod === 'wallet') === (data.walletId != null),
    {
      message: 'Wallet wajib diisi untuk metode wallet, dan tidak boleh diisi untuk metode point'
    }
  )

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [expense] = await db.update(idolExpenses).set(body).where(eq(idolExpenses.id, id)).returning()
  if (!expense) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi idol tidak ditemukan' })
  }
  return expense
})
