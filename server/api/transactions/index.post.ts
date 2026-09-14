import { z } from 'zod'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'

const bodySchema = z.object({
  walletId: z.number().int(),
  categoryId: z.number().int(),
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive(),
  note: z.string().max(200).default(''),
  date: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [transaction] = await db.insert(transactions).values(body).returning()
  return transaction
})
