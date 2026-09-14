import { useDb } from '../../db/client'
import { transfers } from '../../db/schema'
import { transferBodySchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, transferBodySchema.parse)
  const db = useDb()

  const [transfer] = await db.insert(transfers).values(body).returning()
  return transfer
})
