// Predio schemas
export const createPredioBodySchema = {
  type: 'object',
  required: ['codigo', 'nombre'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    departamento: { type: 'string', maxLength: 100 },
    municipio: { type: 'string', maxLength: 100 },
    vereda: { type: 'string', maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    tipoExplotacionId: { type: 'integer' },
  },
  additionalProperties: false,
} as const

export const updatePredioBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    departamento: { type: 'string', maxLength: 100 },
    municipio: { type: 'string', maxLength: 100 },
    vereda: { type: 'string', maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    tipoExplotacionId: { type: 'integer' },
  },
  additionalProperties: false,
} as const

// Potrero schemas
export const createPotreroBodySchema = {
  type: 'object',
  required: ['codigo', 'nombre'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    tipoPasto: { type: 'string', maxLength: 100 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    estado: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

export const updatePotreroBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    tipoPasto: { type: 'string', maxLength: 100 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    estado: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

// Sector schemas
export const createSectorBodySchema = {
  type: 'object',
  required: ['codigo', 'nombre'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    tipoPasto: { type: 'string', maxLength: 100 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    estado: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

export const updateSectorBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    areaHectareas: { type: 'number', minimum: 0 },
    tipoPasto: { type: 'string', maxLength: 100 },
    capacidadMaxima: { type: 'integer', minimum: 0 },
    estado: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

// Lote schemas
export const createLoteBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    tipo: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

export const updateLoteBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    tipo: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

// Grupo schemas
export const createGrupoBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateGrupoBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// ConfigParametroPredio schemas
export const createConfigParametroPredioBodySchema = {
  type: 'object',
  required: ['codigo'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 50 },
    valor: { type: 'string' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateConfigParametroPredioBodySchema = {
  type: 'object',
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 50 },
    valor: { type: 'string' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// Common schemas
export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
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

export const predioIdParamsSchema = {
  type: 'object',
  required: ['predioId'],
  properties: {
    predioId: { type: 'integer' },
  },
} as const

export const entityIdParamsSchema = {
  type: 'object',
  required: ['predioId', 'id'],
  properties: {
    predioId: { type: 'integer' },
    id: { type: 'integer' },
  },
} as const
