import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transfers } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [transfer] = await db.delete(transfers).where(eq(transfers.id, id)).returning()
  if (!transfer) {
    throw createError({ statusCode: 404, statusMessage: 'Transfer tidak ditemukan' })
  }
  return { success: true }
})
