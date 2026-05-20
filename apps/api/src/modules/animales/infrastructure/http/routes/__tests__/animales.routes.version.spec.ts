import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import type { IAnimalRepository } from '../../../../domain/repositories/animal.repository'
import type { IImagenRepository } from '../../../../domain/repositories/imagen.repository'
import type { IAnimalImagenRepository } from '../../../../domain/repositories/animal-imagen.repository'
import type { AnimalEntity } from '../../../../domain/entities/animal.entity'
import type { UpdateAnimalDto } from '../../../../application/dtos/animal.dto'
import { UpdateAnimalUseCase } from '../../../../application/use-cases/update-animal.use-case'
import { GetAnimalUseCase } from '../../../../application/use-cases/get-animal.use-case'
import { CrearAnimalUseCase } from '../../../../application/use-cases/crear-animal.use-case'
import { VersionConflictError } from '../../../../../../shared/errors'

// Minimal route handler for version header testing without full auth
async function createTestApp(
  animalRepo: IAnimalRepository,
): Promise<FastifyInstance> {
  const app = Fastify()

  // Bypass auth
  app.addHook('preHandler', async (request) => {
    ;(request as any).currentUser = { predioIds: [1] }
  })

  const getAnimalUseCase = new GetAnimalUseCase(animalRepo)
  const crearAnimalUseCase = new CrearAnimalUseCase(animalRepo)
  const updateAnimalUseCase = new UpdateAnimalUseCase(animalRepo)

  // GET /animales/:id
  app.get('/animales/:id', async (request, reply) => {
    const result = await getAnimalUseCase.execute(
      (request.params as any).id,
      (request as any).currentUser.predioIds[0],
    )
    return reply
      .header('X-Resource-Version', result.version)
      .send({ success: true, data: result })
  })

  // POST /animales
  app.post('/animales', async (request, reply) => {
    const result = await crearAnimalUseCase.execute(
      request.body as any,
      (request as any).currentUser.predioIds[0],
    )
    return reply
      .code(201)
      .header('X-Resource-Version', result.version)
      .send({ success: true, data: result })
  })

  // PUT /animales/:id
  app.put('/animales/:id', async (request, reply) => {
    const ifMatch = request.headers['if-match']

    if (!ifMatch) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'MISSING_IF_MATCH',
          message: 'Se requiere el header If-Match para actualizar este recurso.',
          details: { field: 'If-Match' },
        },
      })
    }

    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_IF_MATCH',
          message: 'El header If-Match debe ser un número entero.',
          details: { field: 'If-Match' },
        },
      })
    }

    try {
      const result = await updateAnimalUseCase.execute(
        (request.params as any).id,
        (request as any).currentUser.predioIds[0],
        request.body as UpdateAnimalDto,
        expectedVersion,
      )
      return reply
        .header('X-Resource-Version', result.version)
        .send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) {
        return reply.code(409).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        })
      }
      throw error
    }
  })

  return app
}

describe('animales routes - optimistic locking', () => {
  let app: FastifyInstance
  let mockAnimalRepo: IAnimalRepository

  const mockAnimal: AnimalEntity = {
    id: 1, version: 3, predioId: 1, codigo: 'A001', nombre: 'Test',
    fechaNacimiento: null, fechaCompra: null, sexoKey: null, tipoIngresoId: null,
    madreId: null, codigoMadre: null, indTransferenciaEmb: null, codigoDonadora: null,
    tipoPadreKey: null, padreId: null, codigoPadre: null, codigoPajuela: null,
    configRazasId: null, potreroId: null, precioCompra: null, pesoCompra: null,
    codigoRfid: null, codigoArete: null, codigoQr: null, saludAnimalKey: null,
    estadoAnimalKey: null, indDescartado: null, activo: 1, createdAt: null, updatedAt: null,
  }

  beforeEach(async () => {
    mockAnimalRepo = {
      findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      findById: vi.fn().mockResolvedValue(mockAnimal),
      findByCodigo: vi.fn(),
      create: vi.fn().mockResolvedValue({ ...mockAnimal, id: 1, version: 1 }),
      update: vi.fn().mockResolvedValue({ ...mockAnimal, version: 4, nombre: 'Updated' }),
      softDelete: vi.fn(),
      getGenealogy: vi.fn(),
    }

    app = await createTestApp(mockAnimalRepo)
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /animales/:id (REQ-4)', () => {
    it('should return X-Resource-Version header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/animales/1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['x-resource-version']).toBe('3')
    })
  })

  describe('PUT /animales/:id (REQ-5, REQ-6, REQ-7, REQ-17)', () => {
    it('should return 400 MISSING_IF_MATCH when If-Match header is absent', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/animales/1',
        payload: { nombre: 'Updated' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.error.code).toBe('MISSING_IF_MATCH')
    })

    it('should return 400 for non-integer If-Match value', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/animales/1',
        headers: { 'If-Match': 'abc' },
        payload: { nombre: 'Updated' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should return 409 VERSION_CONFLICT when version mismatches', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/animales/1',
        headers: { 'If-Match': '1' },
        payload: { nombre: 'Updated' },
      })

      expect(response.statusCode).toBe(409)
      const body = response.json()
      expect(body.error.code).toBe('VERSION_CONFLICT')
      expect(body.error.details.currentVersion).toEqual(['3'])
      expect(body.error.details.expectedVersion).toEqual(['1'])
    })

    it('should return 200 with X-Resource-Version on successful update', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/animales/1',
        headers: { 'If-Match': '3' },
        payload: { nombre: 'Updated' },
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['x-resource-version']).toBe('4')
      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.data.version).toBe(4)
    })
  })

  describe('POST /animales (REQ-8)', () => {
    it('should return X-Resource-Version: 1 on create', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/animales',
        payload: { codigo: 'NEW001', nombre: 'New Animal' },
      })

      expect(response.statusCode).toBe(201)
      expect(response.headers['x-resource-version']).toBe('1')
    })
  })
})
