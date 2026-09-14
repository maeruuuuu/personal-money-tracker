import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'
import { transactionBodySchema } from '../../utils/schemas'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, transactionBodySchema.parse)
  const db = useDb()

  const [transaction] = await db.insert(transactions).values(body).returning()
  return transaction
})
