import type { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'

export async function rateLimitPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_API_MAX ?? 200),
    timeWindow: Number(process.env.RATE_LIMIT_API_WINDOW_MS ?? 60000),
  })
}
