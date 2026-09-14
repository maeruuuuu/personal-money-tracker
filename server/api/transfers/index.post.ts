import { z } from 'zod'
import { useDb } from '../../db/client'
import { transfers } from '../../db/schema'

const bodySchema = z
  .object({
    fromWalletId: z.number().int(),
    toWalletId: z.number().int(),
    amount: z.number().int().positive(),
    note: z.string().max(200).default(''),
    date: z.string().min(1)
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Wallet asal dan tujuan tidak boleh sama'
  })

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [transfer] = await db.insert(transfers).values(body).returning()
  return transfer
})
