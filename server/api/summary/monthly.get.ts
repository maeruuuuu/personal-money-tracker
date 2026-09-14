import { getMonthlySummary } from '../../utils/balance'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const month = typeof query.month === 'string' && /^\d{4}-\d{2}$/.test(query.month) ? query.month : undefined

  if (!month) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter month (YYYY-MM) wajib diisi' })
  }

  return getMonthlySummary(month)
})
