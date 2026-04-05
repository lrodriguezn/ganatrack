// Palpaciones schemas
export const createPalpacionGrupalBodySchema = {
  type: 'object',
  required: ['codigo', 'fecha', 'animales'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    fecha: { type: 'string', format: 'date-time' },
    veterinariosId: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
    animales: {
      type: 'array',
      items: {
        type: 'object',
        required: ['animalId'],
        properties: {
          animalId: { type: 'integer' },
          veterinarioId: { type: 'integer' },
          diagnosticoId: { type: 'integer' },
          condicionCorporalId: { type: 'integer' },
          fecha: { type: 'string', format: 'date-time' },
          diasGestacion: { type: 'integer' },
          fechaParto: { type: 'string', format: 'date-time' },
          comentarios: { type: 'string', maxLength: 500 },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  additionalProperties: false,
} as const

export const updatePalpacionGrupalBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    fecha: { type: 'string', format: 'date-time' },
    veterinariosId: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const listPalpacionesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const

export const createPalpacionAnimalBodySchema = {
  type: 'object',
  required: ['animalId'],
  properties: {
    animalId: { type: 'integer' },
    veterinarioId: { type: 'integer' },
    diagnosticoId: { type: 'integer' },
    condicionCorporalId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    diasGestacion: { type: 'integer' },
    fechaParto: { type: 'string', format: 'date-time' },
    comentarios: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const updatePalpacionAnimalBodySchema = {
  type: 'object',
  properties: {
    veterinarioId: { type: 'integer' },
    diagnosticoId: { type: 'integer' },
    condicionCorporalId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    diasGestacion: { type: 'integer' },
    fechaParto: { type: 'string', format: 'date-time' },
    comentarios: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
  },
} as const

export const grupalIdParamsSchema = {
  type: 'object',
  required: ['grupalId'],
  properties: {
    grupalId: { type: 'integer' },
  },
} as const
