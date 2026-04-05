// Animal schemas
export const createAnimalBodySchema = {
  type: 'object',
  required: ['codigo'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 50 },
    nombre: { type: 'string', maxLength: 100 },
    fechaNacimiento: { type: 'string', format: 'date-time' },
    fechaCompra: { type: 'string', format: 'date-time' },
    sexoKey: { type: 'integer' },
    tipoIngresoId: { type: 'integer' },
    madreId: { type: 'integer' },
    codigoMadre: { type: 'string', maxLength: 50 },
    indTransferenciaEmb: { type: 'integer' },
    codigoDonadora: { type: 'string', maxLength: 50 },
    tipoPadreKey: { type: 'integer' },
    padreId: { type: 'integer' },
    codigoPadre: { type: 'string', maxLength: 50 },
    codigoPajuela: { type: 'string', maxLength: 50 },
    configRazasId: { type: 'integer' },
    potreroId: { type: 'integer' },
    precioCompra: { type: 'number' },
    pesoCompra: { type: 'number' },
    codigoRfid: { type: 'string', maxLength: 100 },
    codigoArete: { type: 'string', maxLength: 50 },
    codigoQr: { type: 'string', maxLength: 100 },
    saludAnimalKey: { type: 'integer' },
    estadoAnimalKey: { type: 'integer' },
    indDescartado: { type: 'integer' },
  },
  additionalProperties: false,
} as const

export const updateAnimalBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', maxLength: 100 },
    fechaNacimiento: { type: 'string', format: 'date-time' },
    fechaCompra: { type: 'string', format: 'date-time' },
    sexoKey: { type: 'integer' },
    tipoIngresoId: { type: 'integer' },
    madreId: { type: 'integer' },
    codigoMadre: { type: 'string', maxLength: 50 },
    indTransferenciaEmb: { type: 'integer' },
    codigoDonadora: { type: 'string', maxLength: 50 },
    tipoPadreKey: { type: 'integer' },
    padreId: { type: 'integer' },
    codigoPadre: { type: 'string', maxLength: 50 },
    codigoPajuela: { type: 'string', maxLength: 50 },
    configRazasId: { type: 'integer' },
    potreroId: { type: 'integer' },
    precioCompra: { type: 'number' },
    pesoCompra: { type: 'number' },
    codigoRfid: { type: 'string', maxLength: 100 },
    codigoArete: { type: 'string', maxLength: 50 },
    codigoQr: { type: 'string', maxLength: 100 },
    saludAnimalKey: { type: 'integer' },
    estadoAnimalKey: { type: 'integer' },
    indDescartado: { type: 'integer' },
  },
  additionalProperties: false,
} as const

export const listAnimalesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
    potreroId: { type: 'integer' },
    estado: { type: 'integer' },
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

export const genealogiaParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
    maxDepth: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
  },
} as const

// Imagen schemas
export const createImagenBodySchema = {
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

export const updateImagenBodySchema = {
  type: 'object',
  properties: {
    ruta: { type: 'string', maxLength: 500 },
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

// Animal-Imagen junction schemas
export const assignImagenBodySchema = {
  type: 'object',
  required: ['imagenId'],
  properties: {
    imagenId: { type: 'integer' },
  },
  additionalProperties: false,
} as const
