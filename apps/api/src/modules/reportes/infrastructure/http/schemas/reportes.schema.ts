// JSON Schemas for all Reportes endpoints

// ============================================================================
// Shared parameter schemas
// ============================================================================

export const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer' },
  },
} as const

export const jobIdParamsSchema = {
  type: 'object',
  required: ['jobId'],
  properties: {
    jobId: { type: 'integer' },
  },
} as const

// ============================================================================
// Filter query schemas
// ============================================================================

export const reportesQuerySchema = {
  type: 'object',
  properties: {
    fechaInicio: { type: 'string', format: 'date' },
    fechaFin: { type: 'string', format: 'date' },
    potreroId: { type: 'integer' },
    categoriaId: { type: 'integer' },
    razaId: { type: 'integer' },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Report type parameter schema
// ============================================================================

export const reportTipoParamsSchema = {
  type: 'object',
  required: ['tipo'],
  properties: {
    tipo: {
      type: 'string',
      enum: ['inventario', 'reproductivo', 'mortalidad', 'movimiento', 'sanitario'],
    },
  },
} as const

// ============================================================================
// Export request body schema
// ============================================================================

export const exportRequestBodySchema = {
  type: 'object',
  required: ['tipo', 'formato'],
  properties: {
    tipo: {
      type: 'string',
      enum: ['inventario', 'reproductivo', 'mortalidad', 'movimiento', 'sanitario'],
    },
    formato: {
      type: 'string',
      enum: ['pdf', 'xlsx', 'csv', 'json'],
    },
    filtros: {
      type: 'object',
      properties: {
        fechaInicio: { type: 'string', format: 'date' },
        fechaFin: { type: 'string', format: 'date' },
        potreroId: { type: 'integer' },
        categoriaId: { type: 'integer' },
        razaId: { type: 'integer' },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Pagination query schemas
// ============================================================================

export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Export job list query schema
// ============================================================================

export const exportJobsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  additionalProperties: false,
} as const

// ============================================================================
// Response schemas
// ============================================================================

export const inventarioReportResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        resumen: {
          type: 'object',
          properties: {
            totalAnimales: { type: 'integer' },
            porCategoria: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  categoria: { type: 'string' },
                  cantidad: { type: 'integer' },
                },
              },
            },
            porRaza: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  raza: { type: 'string' },
                  cantidad: { type: 'integer' },
                },
              },
            },
            porPotrero: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  potrero: { type: 'string' },
                  cantidad: { type: 'integer' },
                },
              },
            },
          },
        },
        detalle: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              animalId: { type: 'integer' },
              codigo: { type: 'string' },
              nombre: { type: 'string' },
              categoria: { type: 'string' },
              raza: { type: 'string' },
              potrero: { type: 'string' },
              estado: { type: 'string' },
            },
          },
        },
      },
    },
  },
} as const

export const exportStatusResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        jobId: { type: 'integer' },
        status: {
          type: 'string',
          enum: ['pendiente', 'procesando', 'completado', 'fallido'],
        },
        progress: { type: 'integer' },
        downloadUrl: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
} as const

export const exportJobResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        jobId: { type: 'integer' },
        tipo: { type: 'string' },
        formato: { type: 'string' },
        estado: { type: 'string' },
        progreso: { type: 'integer' },
        rutaArchivo: { type: ['string', 'null'] },
        createdAt: { type: 'string' },
      },
    },
  },
} as const

export const exportJobListResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jobId: { type: 'integer' },
              tipo: { type: 'string' },
              formato: { type: 'string' },
              estado: { type: 'string' },
              progreso: { type: 'integer' },
              rutaArchivo: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
            },
          },
        },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
      },
    },
  },
} as const

export const countReportDataResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        tipo: { type: 'string' },
        count: { type: 'integer' },
        estimatedTime: { type: 'integer' },
        requiresAsync: { type: 'boolean' },
      },
    },
  },
} as const
