import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

export async function corsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? true,
    credentials: true,
  })
}
