import type { H3Event } from 'h3'

interface SessionData {
  loggedIn?: boolean
}

export function getAuthSession(event: H3Event) {
  const config = useRuntimeConfig()
  return useSession<SessionData>(event, {
    name: 'money-tracker-session',
    password: config.sessionPassword
  })
}

export async function requireAuth(event: H3Event) {
  const session = await getAuthSession(event)
  if (!session.data.loggedIn) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
