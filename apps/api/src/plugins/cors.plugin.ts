import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'

export async function corsPlugin(app: FastifyInstance): Promise<void> {
  // Allow all origins with credentials
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
  })

  // Handle preflight requests explicitly
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.method === 'OPTIONS') {
      const origin = request.headers.origin
      reply.header('Access-Control-Allow-Origin', origin ?? '*')
      reply.header('Access-Control-Allow-Credentials', 'true')
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
      reply.header('Access-Control-Max-Age', '86400')
      return reply.status(204).send()
    }
  })
}
