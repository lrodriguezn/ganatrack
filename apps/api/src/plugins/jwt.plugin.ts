import type { FastifyInstance } from 'fastify'
import fjwt from '@fastify/jwt'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export async function jwtPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fjwt, {
    secret: JWT_SECRET as string,
    cookie: {
      cookieName: 'refreshToken',
      signed: false,
    },
  })
}
