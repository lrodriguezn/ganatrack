import type { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

export async function corsPlugin(app: FastifyInstance): Promise<void> {
  // Simple CORS config - allow all origins
  await app.register(cors, {
    origin: true,
    credentials: true,
  })
}
