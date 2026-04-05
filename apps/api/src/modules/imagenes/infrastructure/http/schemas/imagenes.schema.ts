export const uploadImagenBodySchema = {
  type: 'object',
  required: ['ruta'],
  properties: {
    ruta: { type: 'string', minLength: 1, maxLength: 500 },
    nombreOriginal: { type: 'string', maxLength: 255 },
    mimeType: { type: 'string', maxLength: 100 },
    tamanoBytes: { type: 'integer' },
    descripcion: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
} as const

export const listImagenesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
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
