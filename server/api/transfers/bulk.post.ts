import { z } from 'zod'
import { useDb } from '../../db/client'
import { transfers } from '../../db/schema'
import { transferBodySchema } from '../../utils/schemas'

const bodySchema = z.object({
  items: z.array(transferBodySchema).min(1).max(200)
})

const CHUNK_SIZE = 100

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  await db.transaction(async (tx) => {
    for (const batch of chunk(body.items, CHUNK_SIZE)) {
      await tx.insert(transfers).values(batch)
    }
  })

  return { inserted: body.items.length }
})
