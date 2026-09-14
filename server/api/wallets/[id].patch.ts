import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { wallets } from '../../db/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(60).optional(),
  type: z.enum(['cash', 'bank', 'ewallet', 'other']).optional(),
  initialBalance: z.number().optional(),
  color: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [wallet] = await db.update(wallets).set(body).where(eq(wallets.id, id)).returning()
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet tidak ditemukan' })
  }
  return wallet
})
