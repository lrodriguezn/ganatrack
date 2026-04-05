import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '../errors/index.js'

export function errorHandler(
  error: FastifyError | DomainError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    })
  }

  // Fastify validation error (JSON Schema)
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: { body: error.validation.map((v: { message?: string }) => v.message ?? 'Campo inválido') },
      },
    })
  }

  // Unexpected error
  reply.log.error(error)
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    },
  })
}
