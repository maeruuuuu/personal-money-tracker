import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { wallets } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  const [wallet] = await db.delete(wallets).where(eq(wallets.id, id)).returning()
  if (!wallet) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet tidak ditemukan' })
  }
  return { success: true }
})
