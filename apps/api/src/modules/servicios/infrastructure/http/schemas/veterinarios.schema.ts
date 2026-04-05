// Veterinarios schemas
export const createVeterinarioGrupalBodySchema = {
  type: 'object',
  required: ['codigo', 'fecha', 'animales'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    fecha: { type: 'string', format: 'date-time' },
    veterinariosId: { type: 'integer' },
    tipoServicio: { type: 'string', maxLength: 100 },
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
          fecha: { type: 'string', format: 'date-time' },
          tipoDiagnosticoKey: { type: 'integer' },
          tratamiento: { type: 'string', maxLength: 500 },
          medicamentos: { type: 'string', maxLength: 500 },
          dosis: { type: 'string', maxLength: 100 },
          comentarios: { type: 'string', maxLength: 500 },
          productos: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productoId'],
              properties: {
                productoId: { type: 'integer' },
                cantidad: { type: 'number' },
                unidad: { type: 'string', maxLength: 20 },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
  },
  additionalProperties: false,
} as const

export const updateVeterinarioGrupalBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    fecha: { type: 'string', format: 'date-time' },
    veterinariosId: { type: 'integer' },
    tipoServicio: { type: 'string', maxLength: 100 },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const listVeterinariosQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const

export const createVeterinarioAnimalBodySchema = {
  type: 'object',
  required: ['animalId'],
  properties: {
    animalId: { type: 'integer' },
    veterinarioId: { type: 'integer' },
    diagnosticoId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    tipoDiagnosticoKey: { type: 'integer' },
    tratamiento: { type: 'string', maxLength: 500 },
    medicamentos: { type: 'string', maxLength: 500 },
    dosis: { type: 'string', maxLength: 100 },
    comentarios: { type: 'string', maxLength: 500 },
    productos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['productoId'],
        properties: {
          productoId: { type: 'integer' },
          cantidad: { type: 'number' },
          unidad: { type: 'string', maxLength: 20 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const

export const updateVeterinarioAnimalBodySchema = {
  type: 'object',
  properties: {
    veterinarioId: { type: 'integer' },
    diagnosticoId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    tipoDiagnosticoKey: { type: 'integer' },
    tratamiento: { type: 'string', maxLength: 500 },
    medicamentos: { type: 'string', maxLength: 500 },
    dosis: { type: 'string', maxLength: 100 },
    comentarios: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const
