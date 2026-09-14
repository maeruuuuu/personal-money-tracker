import { getSummary } from '../utils/balance'

export default defineEventHandler(async () => {
  return getSummary()
})
