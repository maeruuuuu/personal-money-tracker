import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { categories } from '../../db/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(60).optional(),
  type: z.enum(['income', 'expense']).optional(),
  color: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const [category] = await db.update(categories).set(body).where(eq(categories.id, id)).returning()
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
  }
  return category
})
