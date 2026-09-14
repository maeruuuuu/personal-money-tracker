import { getAuthSession } from '../utils/auth'

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/me']

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]
  if (!path.startsWith('/api/')) return
  if (PUBLIC_PATHS.includes(path)) return

  const session = await getAuthSession(event)
  if (!session.data.loggedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
