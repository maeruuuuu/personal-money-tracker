import { desc, sql } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { idolTopups } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDb()

  const baseQuery = () =>
    db.select().from(idolTopups).orderBy(desc(idolTopups.date), desc(idolTopups.id))

  if (!query.page) {
    return baseQuery()
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20))

  const [items, [{ count }]] = await Promise.all([
    baseQuery()
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(idolTopups)
  ])

  const total = Number(count)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  }
})
