import { getAuthSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  return { loggedIn: Boolean(session.data.loggedIn) }
})
