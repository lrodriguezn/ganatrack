// Inseminaciones schemas
export const createInseminacionGrupalBodySchema = {
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
          fecha: { type: 'string', format: 'date-time' },
          tipoInseminacionKey: { type: 'integer' },
          codigoPajuela: { type: 'string', maxLength: 50 },
          diagnosticoId: { type: 'integer' },
          observaciones: { type: 'string', maxLength: 500 },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  additionalProperties: false,
} as const

export const updateInseminacionGrupalBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    fecha: { type: 'string', format: 'date-time' },
    veterinariosId: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const listInseminacionesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const

export const createInseminacionAnimalBodySchema = {
  type: 'object',
  required: ['animalId'],
  properties: {
    animalId: { type: 'integer' },
    veterinarioId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    tipoInseminacionKey: { type: 'integer' },
    codigoPajuela: { type: 'string', maxLength: 50 },
    diagnosticoId: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const updateInseminacionAnimalBodySchema = {
  type: 'object',
  properties: {
    veterinarioId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    tipoInseminacionKey: { type: 'integer' },
    codigoPajuela: { type: 'string', maxLength: 50 },
    diagnosticoId: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const
