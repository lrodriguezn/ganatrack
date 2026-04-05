export const createProductoBodySchema = {
  type: 'object',
  required: ['codigo'],
  properties: {
    codigo: { type: 'string', minLength: 1, maxLength: 20 },
    nombre: { type: 'string', maxLength: 100 },
    descripcion: { type: 'string', maxLength: 500 },
    tipoProducto: { type: 'string', maxLength: 50 },
    categoria: { type: 'string', maxLength: 100 },
    presentacion: { type: 'string', maxLength: 50 },
    unidadMedida: { type: 'string', maxLength: 20 },
    precioUnitario: { type: 'number' },
    stockMinimo: { type: 'number' },
    stockActual: { type: 'number' },
    fechaVencimiento: { type: 'string', format: 'date-time' },
    laboratorio: { type: 'string', maxLength: 100 },
    registroInvima: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

export const updateProductoBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', maxLength: 100 },
    descripcion: { type: 'string', maxLength: 500 },
    tipoProducto: { type: 'string', maxLength: 50 },
    categoria: { type: 'string', maxLength: 100 },
    presentacion: { type: 'string', maxLength: 50 },
    unidadMedida: { type: 'string', maxLength: 20 },
    precioUnitario: { type: 'number' },
    stockMinimo: { type: 'number' },
    stockActual: { type: 'number' },
    fechaVencimiento: { type: 'string', format: 'date-time' },
    laboratorio: { type: 'string', maxLength: 100 },
    registroInvima: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
} as const

export const listProductosQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    tipo_producto_key: { type: 'string' },
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
