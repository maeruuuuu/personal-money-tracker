import { z } from 'zod'
import { useDb } from '../../db/client'
import { wallets } from '../../db/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(60),
  type: z.enum(['cash', 'bank', 'ewallet', 'other']).default('cash'),
  initialBalance: z.number().default(0),
  color: z.string().min(1).default('#4d96ff'),
  status: z.enum(['active', 'inactive']).default('active')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [wallet] = await db.insert(wallets).values(body).returning()
  return wallet
})
