import { z } from 'zod'
import { useDb } from '../../db/client'
import { categories } from '../../db/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(60),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1).default('#ffd93d')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [category] = await db.insert(categories).values(body).returning()
  return category
})
