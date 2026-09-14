import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { categories } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  if (query.type === 'income' || query.type === 'expense') {
    return db.select().from(categories).where(eq(categories.type, query.type))
  }

  return db.select().from(categories)
})
