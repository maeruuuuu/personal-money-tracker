import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { idolTopups } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [topup] = await db.delete(idolTopups).where(eq(idolTopups.id, id)).returning()
  if (!topup) {
    throw createError({ statusCode: 404, statusMessage: 'Topup tidak ditemukan' })
  }
  return { success: true }
})
