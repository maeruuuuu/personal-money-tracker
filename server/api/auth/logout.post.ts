import { getAuthSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  await session.clear()
  return { loggedIn: false }
})
