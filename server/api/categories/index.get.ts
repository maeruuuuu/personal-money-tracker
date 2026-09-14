import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { categories } from '../../db/schema'

function sortCategories<T extends { status: string; name: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const statusDiff = Number(a.status === 'inactive') - Number(b.status === 'inactive')
    if (statusDiff !== 0) return statusDiff
    return a.name.localeCompare(b.name)
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  if (query.type === 'income' || query.type === 'expense') {
    const items = await db.select().from(categories).where(eq(categories.type, query.type))
    return sortCategories(items)
  }

  const items = await db.select().from(categories)
  return sortCategories(items)
})
