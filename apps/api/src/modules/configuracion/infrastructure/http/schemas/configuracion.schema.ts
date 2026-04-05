// Raza schemas
export const createConfigRazaBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    origen: { type: 'string', maxLength: 100 },
    tipoProduccion: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

export const updateConfigRazaBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    origen: { type: 'string', maxLength: 100 },
    tipoProduccion: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

// Condicion Corporal schemas
export const createConfigCondicionCorporalBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    valorMin: { type: 'integer', minimum: 0 },
    valorMax: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
} as const

export const updateConfigCondicionCorporalBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
    valorMin: { type: 'integer', minimum: 0 },
    valorMax: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
} as const

// Tipo Explotacion schemas
export const createConfigTipoExplotacionBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateConfigTipoExplotacionBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// Calidad Animal schemas
export const createConfigCalidadAnimalBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateConfigCalidadAnimalBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// Color schemas
export const createConfigColorBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 50 },
    codigo: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

export const updateConfigColorBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 50 },
    codigo: { type: 'string', maxLength: 20 },
  },
  additionalProperties: false,
} as const

// Rango Edad schemas
export const createConfigRangoEdadBodySchema = {
  type: 'object',
  required: ['nombre', 'rango1', 'rango2'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    rango1: { type: 'integer', minimum: 0 },
    rango2: { type: 'integer', minimum: 0 },
    sexo: { type: 'integer' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateConfigRangoEdadBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    rango1: { type: 'integer', minimum: 0 },
    rango2: { type: 'integer', minimum: 0 },
    sexo: { type: 'integer' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// Key Value schemas
export const createConfigKeyValueBodySchema = {
  type: 'object',
  required: ['opcion', 'key'],
  properties: {
    opcion: { type: 'string', minLength: 1, maxLength: 50 },
    key: { type: 'string', minLength: 1, maxLength: 100 },
    value: { type: 'string' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

export const updateConfigKeyValueBodySchema = {
  type: 'object',
  properties: {
    opcion: { type: 'string', minLength: 1, maxLength: 50 },
    key: { type: 'string', minLength: 1, maxLength: 100 },
    value: { type: 'string' },
    descripcion: { type: 'string', maxLength: 255 },
  },
  additionalProperties: false,
} as const

// Common query schema
export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
    opcion: { type: 'string' },
  },
  additionalProperties: false,
} as const

// ID params schema
export const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
  },
} as const
