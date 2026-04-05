export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
  additionalProperties: false,
} as const

export const verify2faBodySchema = {
  type: 'object',
  required: ['tempToken', 'codigo'],
  properties: {
    tempToken: { type: 'string' },
    codigo: { type: 'string', pattern: '^[0-9]{6}$' },
  },
  additionalProperties: false,
} as const

export const resend2faBodySchema = {
  type: 'object',
  required: ['tempToken'],
  properties: {
    tempToken: { type: 'string' },
  },
  additionalProperties: false,
} as const

export const changePasswordBodySchema = {
  type: 'object',
  required: ['passwordActual', 'passwordNuevo'],
  properties: {
    passwordActual: { type: 'string' },
    passwordNuevo: { type: 'string', minLength: 8 },
  },
  additionalProperties: false,
} as const
