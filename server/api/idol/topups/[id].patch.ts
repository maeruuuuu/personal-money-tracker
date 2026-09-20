import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { idolTopups } from '../../../db/schema'

const bodySchema = z.object({
  amount: z.number().positive().optional(),
  note: z.string().max(200).optional(),
  date: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [topup] = await db.update(idolTopups).set(body).where(eq(idolTopups.id, id)).returning()
  if (!topup) {
    throw createError({ statusCode: 404, statusMessage: 'Topup tidak ditemukan' })
  }
  return topup
})
