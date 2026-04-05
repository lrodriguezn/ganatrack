import { NOTIFICACION_TIPOS } from '../../../application/dtos/notificacion.dto.js'

// ============================================================================
// Query Schemas
// ============================================================================

export const listNotificacionesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    leida: { type: 'integer', enum: [0, 1] },
    tipo: { type: 'string', enum: NOTIFICACION_TIPOS as unknown as string[] },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Params Schemas
// ============================================================================

export const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
  },
} as const

export const tipoParamsSchema = {
  type: 'object',
  required: ['tipo'],
  properties: {
    tipo: { type: 'string', enum: NOTIFICACION_TIPOS as unknown as string[] },
  },
} as const

export const tokenParamsSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string' },
  },
} as const

// ============================================================================
// Body Schemas
// ============================================================================

export const actualizarPreferenciaBodySchema = {
  type: 'object',
  required: ['inapp', 'email', 'push'],
  properties: {
    inapp: { type: 'boolean' },
    email: { type: 'boolean' },
    push: { type: 'boolean' },
    diasAnticipacion: { type: 'integer', minimum: 1, maximum: 30, default: 7 },
  },
  additionalProperties: false,
} as const

export const registrarPushTokenBodySchema = {
  type: 'object',
  required: ['token', 'plataforma'],
  properties: {
    token: { type: 'string', minLength: 1, maxLength: 500 },
    plataforma: { type: 'string', enum: ['android', 'ios', 'web'] },
  },
  additionalProperties: false,
} as const

export const evaluarAlertasBodySchema = {
  type: 'object',
  properties: {
    predioId: { type: 'integer' },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Response Schemas
// ============================================================================

export const notificacionResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        tipo: { type: 'string' },
        titulo: { type: 'string' },
        mensaje: { type: 'string' },
        leida: { type: 'boolean' },
        fechaEvento: { type: ['string', 'null'] },
        fechaCreacion: { type: 'string' },
        entidadTipo: { type: ['string', 'null'] },
        entidadId: { type: ['integer', 'null'] },
      },
    },
  },
} as const

export const notificacionListResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'array',
      items: { type: 'object' },
    },
    meta: {
      type: 'object',
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
      },
    },
  },
} as const

export const resumenResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        noLeidas: { type: 'integer' },
        porTipo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string' },
              count: { type: 'integer' },
            },
          },
        },
      },
    },
  },
} as const

export const preferenciaListResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string' },
          canal: {
            type: 'object',
            properties: {
              inapp: { type: 'boolean' },
              email: { type: 'boolean' },
              push: { type: 'boolean' },
            },
          },
          diasAnticipacion: { type: 'integer' },
        },
      },
    },
  },
} as const

export const preferenciaResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        tipo: { type: 'string' },
        canal: {
          type: 'object',
          properties: {
            inapp: { type: 'boolean' },
            email: { type: 'boolean' },
            push: { type: 'boolean' },
          },
        },
        diasAnticipacion: { type: 'integer' },
      },
    },
  },
} as const

export const pushTokenResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        token: { type: 'string' },
        plataforma: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  },
} as const

export const evaluarAlertasResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        notificacionesCreadas: { type: 'integer' },
        prediosEvaluados: { type: 'integer' },
        tiempoEjecucionMs: { type: 'integer' },
      },
    },
  },
} as const

export const messageResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
} as const
