import type { FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export async function cookiePlugin(app: FastifyInstance): Promise<void> {
  await app.register(cookie, {
    secret: JWT_SECRET,
  })
}
