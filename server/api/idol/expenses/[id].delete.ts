import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { idolExpenses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [expense] = await db.delete(idolExpenses).where(eq(idolExpenses.id, id)).returning()
  if (!expense) {
    throw createError({ statusCode: 404, statusMessage: 'Transaksi idol tidak ditemukan' })
  }
  return { success: true }
})
