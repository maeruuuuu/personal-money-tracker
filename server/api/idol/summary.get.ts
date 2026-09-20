import { getIdolExpenseSummary } from '../../utils/balance'

export default defineEventHandler(async () => {
  return getIdolExpenseSummary()
})
