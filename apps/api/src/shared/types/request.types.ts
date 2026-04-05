import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: {
      id: number
      roles: string[]
      permisos?: string[]  // resolved permissions from roles
      predioIds: number[]
    }
    predioId: number
  }
}
