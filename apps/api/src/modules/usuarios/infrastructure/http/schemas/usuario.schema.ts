export const createUsuarioBodySchema = {
  type: 'object',
  required: ['nombre', 'email', 'password'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email', maxLength: 100 },
    password: { type: 'string', minLength: 8 },
    rolesIds: { type: 'array', items: { type: 'integer' } },
  },
  additionalProperties: false,
} as const

export const updateUsuarioBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email', maxLength: 100 },
    activo: { type: 'integer', enum: [0, 1] },
  },
  additionalProperties: false,
} as const

export const assignRolesBodySchema = {
  type: 'object',
  required: ['rolesIds'],
  properties: {
    rolesIds: { type: 'array', items: { type: 'integer' } },
  },
  additionalProperties: false,
} as const

export const createRolBodySchema = {
  type: 'object',
  required: ['nombre'],
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 50 },
    descripcion: { type: 'string', maxLength: 200 },
    permisosIds: { type: 'array', items: { type: 'integer' } },
  },
  additionalProperties: false,
} as const

export const updateRolBodySchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 50 },
    descripcion: { type: 'string', maxLength: 200 },
    permisosIds: { type: 'array', items: { type: 'integer' } },
  },
  additionalProperties: false,
} as const

export const listUsuariosQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
    activo: { type: 'integer', enum: [0, 1] },
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
