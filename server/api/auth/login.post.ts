import { z } from 'zod'
import { getAuthSession } from '../../utils/auth'

const bodySchema = z.object({
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const config = useRuntimeConfig()

  if (body.password !== config.authPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Password salah' })
  }

  const session = await getAuthSession(event)
  await session.update({ loggedIn: true })

  return { loggedIn: true }
})
