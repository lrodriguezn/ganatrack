// Partos schemas
export const createPartoAnimalBodySchema = {
  type: 'object',
  required: ['animalId', 'fecha', 'crias'],
  properties: {
    animalId: { type: 'integer' },
    fecha: { type: 'string', format: 'date-time' },
    macho: { type: 'integer' },
    hembra: { type: 'integer' },
    muertos: { type: 'integer' },
    peso: { type: 'number' },
    tipoPartoKey: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
    crias: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criaId: { type: 'integer' },
          sexoKey: { type: 'integer' },
          pesoNacimiento: { type: 'number' },
          observaciones: { type: 'string', maxLength: 500 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const

export const updatePartoAnimalBodySchema = {
  type: 'object',
  properties: {
    fecha: { type: 'string', format: 'date-time' },
    macho: { type: 'integer' },
    hembra: { type: 'integer' },
    muertos: { type: 'integer' },
    peso: { type: 'number' },
    tipoPartoKey: { type: 'integer' },
    observaciones: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const listPartosQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const
