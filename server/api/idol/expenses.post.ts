import { useDb } from '../../db/client'
import { idolExpenses } from '../../db/schema'
import { idolExpenseBodySchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, idolExpenseBodySchema.parse)
  const db = useDb()

  const [expense] = await db.insert(idolExpenses).values(body).returning()
  return expense
})
