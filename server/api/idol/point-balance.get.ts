import { getIdolPointBalance } from '../../utils/balance'

export default defineEventHandler(async () => {
  const balance = await getIdolPointBalance()
  return { balance }
})
