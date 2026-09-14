import { getWalletsWithBalance } from '../../utils/balance'

export default defineEventHandler(async () => {
  return getWalletsWithBalance()
})
