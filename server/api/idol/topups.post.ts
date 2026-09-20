import { z } from 'zod'
import { useDb } from '../../db/client'
import { idolTopups } from '../../db/schema'

const bodySchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(200).default(''),
  date: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [topup] = await db.insert(idolTopups).values(body).returning()
  return topup
})
