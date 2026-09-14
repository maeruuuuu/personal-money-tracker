import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { categories } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  try {
    const [category] = await db.delete(categories).where(eq(categories.id, id)).returning()
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan' })
    }
    return { success: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    throw createError({ statusCode: 400, statusMessage: 'Kategori masih dipakai di transaksi' })
  }
})
