// Tenant-scoped schemas
export const createVeterinarioBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, telefono: { type: 'string', maxLength: 20 }, email: { type: 'string', maxLength: 100 }, direccion: { type: 'string' }, numeroRegistro: { type: 'string', maxLength: 50 }, especialidad: { type: 'string', maxLength: 100 } }, additionalProperties: false } as const
export const updateVeterinarioBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, telefono: { type: 'string', maxLength: 20 }, email: { type: 'string', maxLength: 100 }, direccion: { type: 'string' }, numeroRegistro: { type: 'string', maxLength: 50 }, especialidad: { type: 'string', maxLength: 100 } }, additionalProperties: false } as const

export const createPropietarioBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipoDocumento: { type: 'string', maxLength: 20 }, numeroDocumento: { type: 'string', maxLength: 50 }, telefono: { type: 'string', maxLength: 20 }, email: { type: 'string', maxLength: 100 }, direccion: { type: 'string' } }, additionalProperties: false } as const
export const updatePropietarioBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipoDocumento: { type: 'string', maxLength: 20 }, numeroDocumento: { type: 'string', maxLength: 50 }, telefono: { type: 'string', maxLength: 20 }, email: { type: 'string', maxLength: 100 }, direccion: { type: 'string' } }, additionalProperties: false } as const

export const createHierroBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const
export const updateHierroBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const

// Global schemas
export const createDiagnosticoVeterinarioBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' }, categoria: { type: 'string', maxLength: 50 } }, additionalProperties: false } as const
export const updateDiagnosticoVeterinarioBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' }, categoria: { type: 'string', maxLength: 50 } }, additionalProperties: false } as const

export const createMotivoVentaBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const
export const updateMotivoVentaBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const

export const createCausaMuerteBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const
export const updateCausaMuerteBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, descripcion: { type: 'string' } }, additionalProperties: false } as const

export const createLugarCompraBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipo: { type: 'string', maxLength: 50 }, ubicacion: { type: 'string' }, contacto: { type: 'string' }, telefono: { type: 'string', maxLength: 20 } }, additionalProperties: false } as const
export const updateLugarCompraBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipo: { type: 'string', maxLength: 50 }, ubicacion: { type: 'string' }, contacto: { type: 'string' }, telefono: { type: 'string', maxLength: 20 } }, additionalProperties: false } as const

export const createLugarVentaBodySchema = { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipo: { type: 'string', maxLength: 50 }, ubicacion: { type: 'string' }, contacto: { type: 'string' }, telefono: { type: 'string', maxLength: 20 } }, additionalProperties: false } as const
export const updateLugarVentaBodySchema = { type: 'object', properties: { nombre: { type: 'string', minLength: 1, maxLength: 100 }, tipo: { type: 'string', maxLength: 50 }, ubicacion: { type: 'string' }, contacto: { type: 'string' }, telefono: { type: 'string', maxLength: 20 } }, additionalProperties: false } as const

// Common schemas
export const listQuerySchema = { type: 'object', properties: { page: { type: 'integer', minimum: 1, default: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, search: { type: 'string' } }, additionalProperties: false } as const
export const idParamsSchema = { type: 'object', required: ['id'], properties: { id: { type: 'integer' } } } as const
export const entityIdParamsSchema = { type: 'object', required: ['predioId', 'id'], properties: { predioId: { type: 'integer' }, id: { type: 'integer' } } } as const
