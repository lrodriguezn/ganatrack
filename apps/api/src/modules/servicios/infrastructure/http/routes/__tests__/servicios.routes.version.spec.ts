import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import type { IPalpacionGrupalRepository } from '../../../../domain/repositories/palpacion-grupal.repository'
import type { IInseminacionGrupalRepository } from '../../../../domain/repositories/inseminacion-grupal.repository'
import type { IPartoAnimalRepository } from '../../../../domain/repositories/parto-animal.repository'
import type { IVeterinarioGrupalRepository } from '../../../../domain/repositories/veterinario-grupal.repository'
import type { PalpacionGrupalEntity } from '../../../../domain/entities/palpacion.entity'
import type { InseminacionGrupalEntity } from '../../../../domain/entities/inseminacion.entity'
import type { PartoAnimalEntity } from '../../../../domain/entities/parto.entity'
import type { VeterinarioGrupalEntity } from '../../../../domain/entities/veterinario.entity'
import { UpdatePalpacionGrupalUseCase } from '../../../../application/use-cases/update-palpacion-grupal.use-case'
import { UpdateInseminacionGrupalUseCase } from '../../../../application/use-cases/update-inseminacion-grupal.use-case'
import { UpdatePartoUseCase } from '../../../../application/use-cases/update-parto.use-case'
import { UpdateVeterinarioGrupalUseCase } from '../../../../application/use-cases/update-veterinario-grupal.use-case'
import { GetPalpacionGrupalUseCase } from '../../../../application/use-cases/get-palpacion-grupal.use-case'
import { GetInseminacionGrupalUseCase } from '../../../../application/use-cases/get-inseminacion-grupal.use-case'
import { GetPartoUseCase } from '../../../../application/use-cases/get-parto.use-case'
import { GetVeterinarioGrupalUseCase } from '../../../../application/use-cases/get-veterinario-grupal.use-case'
import { VersionConflictError } from '../../../../../../shared/errors'

// Minimal mock for get use cases (need animal/palpacion repos for joined data)
class MockGetPalpacionGrupalUseCase {
  constructor(private entity: PalpacionGrupalEntity) {}
  async execute(id: number, _predioId: number) {
    return { ...this.entity, fecha: this.entity.fecha.toISOString(), createdAt: this.entity.createdAt?.toISOString(), updatedAt: this.entity.updatedAt?.toISOString(), version: this.entity.version, animales: [] }
  }
}
class MockGetInseminacionGrupalUseCase {
  constructor(private entity: InseminacionGrupalEntity) {}
  async execute(id: number, _predioId: number) {
    return { ...this.entity, fecha: this.entity.fecha.toISOString(), createdAt: this.entity.createdAt?.toISOString(), updatedAt: this.entity.updatedAt?.toISOString(), version: this.entity.version, animales: [] }
  }
}
class MockGetPartoUseCase {
  constructor(private entity: PartoAnimalEntity) {}
  async execute(id: number, _predioId: number) {
    return { ...this.entity, fecha: this.entity.fecha.toISOString(), createdAt: this.entity.createdAt?.toISOString(), updatedAt: this.entity.updatedAt?.toISOString(), version: this.entity.version, crias: [] }
  }
}
class MockGetVeterinarioGrupalUseCase {
  constructor(private entity: VeterinarioGrupalEntity) {}
  async execute(id: number, _predioId: number) {
    return { ...this.entity, fecha: this.entity.fecha.toISOString(), createdAt: this.entity.createdAt?.toISOString(), updatedAt: this.entity.updatedAt?.toISOString(), version: this.entity.version, animales: [] }
  }
}

async function createTestApp(
  palpacionRepo: IPalpacionGrupalRepository,
  inseminacionRepo: IInseminacionGrupalRepository,
  partoRepo: IPartoAnimalRepository,
  veterinarioRepo: IVeterinarioGrupalRepository,
): Promise<FastifyInstance> {
  const app = Fastify()

  // Bypass auth
  app.addHook('preHandler', async (request) => {
    ;(request as any).currentUser = { predioIds: [1] }
  })

  const updatePalpacion = new UpdatePalpacionGrupalUseCase(palpacionRepo)
  const updateInseminacion = new UpdateInseminacionGrupalUseCase(inseminacionRepo)
  const updateParto = new UpdatePartoUseCase(partoRepo)
  const updateVeterinario = new UpdateVeterinarioGrupalUseCase(veterinarioRepo)

  const getPalpacion = new MockGetPalpacionGrupalUseCase(await palpacionRepo.findById(1, 0) as PalpacionGrupalEntity)
  const getInseminacion = new MockGetInseminacionGrupalUseCase(await inseminacionRepo.findById(1, 0) as InseminacionGrupalEntity)
  const getParto = new MockGetPartoUseCase(await partoRepo.findById(1, 0) as PartoAnimalEntity)
  const getVeterinario = new MockGetVeterinarioGrupalUseCase(await veterinarioRepo.findById(1, 0) as VeterinarioGrupalEntity)

  // GET endpoints
  app.get('/servicios/palpaciones/:id', async (request, reply) => {
    const result = await (getPalpacion as any).execute((request.params as any).id, 0)
    return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
  })
  app.get('/servicios/inseminaciones/:id', async (request, reply) => {
    const result = await (getInseminacion as any).execute((request.params as any).id, 0)
    return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
  })
  app.get('/servicios/partos/:id', async (request, reply) => {
    const result = await (getParto as any).execute((request.params as any).id, 0)
    return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
  })
  app.get('/servicios/veterinarios/:id', async (request, reply) => {
    const result = await (getVeterinario as any).execute((request.params as any).id, 0)
    return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
  })

  // PUT /servicios/palpaciones/:id
  app.put('/servicios/palpaciones/:id', async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) return reply.code(400).send({ success: false, error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } } })
    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) return reply.code(400).send({ success: false, error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } } })
    try {
      const result = await updatePalpacion.execute((request.params as any).id, request.body as any, 0, expectedVersion)
      return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) return reply.code(409).send({ success: false, error: { code: error.code, message: error.message, details: error.details } })
      throw error
    }
  })

  // PUT /servicios/inseminaciones/:id
  app.put('/servicios/inseminaciones/:id', async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) return reply.code(400).send({ success: false, error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } } })
    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) return reply.code(400).send({ success: false, error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } } })
    try {
      const result = await updateInseminacion.execute((request.params as any).id, request.body as any, 0, expectedVersion)
      return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) return reply.code(409).send({ success: false, error: { code: error.code, message: error.message, details: error.details } })
      throw error
    }
  })

  // PUT /servicios/partos/:id
  app.put('/servicios/partos/:id', async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) return reply.code(400).send({ success: false, error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } } })
    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) return reply.code(400).send({ success: false, error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } } })
    try {
      const result = await updateParto.execute((request.params as any).id, request.body as any, 0, expectedVersion)
      return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) return reply.code(409).send({ success: false, error: { code: error.code, message: error.message, details: error.details } })
      throw error
    }
  })

  // PUT /servicios/veterinarios/:id
  app.put('/servicios/veterinarios/:id', async (request, reply) => {
    const ifMatch = request.headers['if-match']
    if (!ifMatch) return reply.code(400).send({ success: false, error: { code: 'MISSING_IF_MATCH', message: 'Se requiere el header If-Match para actualizar este recurso.', details: { field: 'If-Match' } } })
    const expectedVersion = parseInt(ifMatch as string, 10)
    if (isNaN(expectedVersion)) return reply.code(400).send({ success: false, error: { code: 'INVALID_IF_MATCH', message: 'El header If-Match debe ser un número entero.', details: { field: 'If-Match' } } })
    try {
      const result = await updateVeterinario.execute((request.params as any).id, request.body as any, 0, expectedVersion)
      return reply.header('X-Resource-Version', result.version).send({ success: true, data: result })
    } catch (error) {
      if (error instanceof VersionConflictError) return reply.code(409).send({ success: false, error: { code: error.code, message: error.message, details: error.details } })
      throw error
    }
  })

  return app
}

const makePalpacionRepo = (entity: PalpacionGrupalEntity): IPalpacionGrupalRepository => ({
  findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn().mockResolvedValue(entity),
  findByCodigo: vi.fn(),
  create: vi.fn(),
  update: vi.fn().mockResolvedValue({ ...entity, version: entity.version + 1, updatedAt: new Date() }),
  softDelete: vi.fn(),
})

const makeInseminacionRepo = (entity: InseminacionGrupalEntity): IInseminacionGrupalRepository => ({
  findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn().mockResolvedValue(entity),
  findByCodigo: vi.fn(),
  create: vi.fn(),
  update: vi.fn().mockResolvedValue({ ...entity, version: entity.version + 1, updatedAt: new Date() }),
  softDelete: vi.fn(),
})

const makePartoRepo = (entity: PartoAnimalEntity): IPartoAnimalRepository => ({
  findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn().mockResolvedValue(entity),
  create: vi.fn(),
  update: vi.fn().mockResolvedValue({ ...entity, version: entity.version + 1, updatedAt: new Date() }),
  softDelete: vi.fn(),
})

const makeVeterinarioRepo = (entity: VeterinarioGrupalEntity): IVeterinarioGrupalRepository => ({
  findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn().mockResolvedValue(entity),
  findByCodigo: vi.fn(),
  create: vi.fn(),
  update: vi.fn().mockResolvedValue({ ...entity, version: entity.version + 1, updatedAt: new Date() }),
  softDelete: vi.fn(),
})

const basePalpacion: PalpacionGrupalEntity = {
  id: 1, predioId: 0, codigo: 'PAL-001', fecha: new Date(), veterinariosId: 1, observaciones: null, activo: 1, version: 3, createdAt: new Date(), updatedAt: new Date(),
}
const baseInseminacion: InseminacionGrupalEntity = {
  id: 1, predioId: 0, codigo: 'INS-001', fecha: new Date(), veterinariosId: 1, observaciones: null, activo: 1, version: 3, createdAt: new Date(), updatedAt: new Date(),
}
const baseParto: PartoAnimalEntity = {
  id: 1, predioId: 0, animalId: 10, fecha: new Date(), macho: 1, hembra: 0, muertos: 0, peso: null, tipoPartoKey: 0, observaciones: null, activo: 1, version: 3, createdAt: new Date(), updatedAt: new Date(),
}
const baseVeterinario: VeterinarioGrupalEntity = {
  id: 1, predioId: 0, codigo: 'SV-001', fecha: new Date(), veterinariosId: 1, tipoServicio: null, observaciones: null, activo: 1, version: 3, createdAt: new Date(), updatedAt: new Date(),
}

describe('servicios routes - optimistic locking', () => {
  let app: FastifyInstance

  afterEach(async () => { await app.close() })

  describe('PUT /servicios/palpaciones/:id', () => {
    beforeEach(async () => {
      const repo = makePalpacionRepo({ ...basePalpacion })
      app = await createTestApp(repo, makeInseminacionRepo(baseInseminacion), makePartoRepo(baseParto), makeVeterinarioRepo(baseVeterinario))
      await app.ready()
    })

    it('should return 400 MISSING_IF_MATCH when header is absent', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/palpaciones/1', payload: { codigo: 'NEW' } })
      expect(res.statusCode).toBe(400)
      expect(res.json().error.code).toBe('MISSING_IF_MATCH')
    })

    it('should return 400 for non-integer If-Match', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/palpaciones/1', headers: { 'If-Match': 'abc' }, payload: {} })
      expect(res.statusCode).toBe(400)
    })

    it('should return 409 VERSION_CONFLICT on version mismatch', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/palpaciones/1', headers: { 'If-Match': '1' }, payload: {} })
      expect(res.statusCode).toBe(409)
      expect(res.json().error.code).toBe('VERSION_CONFLICT')
    })

    it('should return 200 with X-Resource-Version on success', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/palpaciones/1', headers: { 'If-Match': '3' }, payload: { codigo: 'NEW' } })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('4')
    })
  })

  describe('PUT /servicios/inseminaciones/:id', () => {
    beforeEach(async () => {
      const repo = makeInseminacionRepo({ ...baseInseminacion })
      app = await createTestApp(makePalpacionRepo(basePalpacion), repo, makePartoRepo(baseParto), makeVeterinarioRepo(baseVeterinario))
      await app.ready()
    })

    it('should return 400 MISSING_IF_MATCH when header is absent', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/inseminaciones/1', payload: {} })
      expect(res.statusCode).toBe(400)
    })

    it('should return 409 on version mismatch', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/inseminaciones/1', headers: { 'If-Match': '1' }, payload: {} })
      expect(res.statusCode).toBe(409)
    })

    it('should return 200 with X-Resource-Version on success', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/inseminaciones/1', headers: { 'If-Match': '3' }, payload: {} })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('4')
    })
  })

  describe('PUT /servicios/partos/:id', () => {
    beforeEach(async () => {
      const repo = makePartoRepo({ ...baseParto })
      app = await createTestApp(makePalpacionRepo(basePalpacion), makeInseminacionRepo(baseInseminacion), repo, makeVeterinarioRepo(baseVeterinario))
      await app.ready()
    })

    it('should return 400 MISSING_IF_MATCH when header is absent', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/partos/1', payload: {} })
      expect(res.statusCode).toBe(400)
    })

    it('should return 409 on version mismatch', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/partos/1', headers: { 'If-Match': '1' }, payload: {} })
      expect(res.statusCode).toBe(409)
    })

    it('should return 200 with X-Resource-Version on success', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/partos/1', headers: { 'If-Match': '3' }, payload: { observaciones: 'Updated' } })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('4')
    })
  })

  describe('PUT /servicios/veterinarios/:id', () => {
    beforeEach(async () => {
      const repo = makeVeterinarioRepo({ ...baseVeterinario })
      app = await createTestApp(makePalpacionRepo(basePalpacion), makeInseminacionRepo(baseInseminacion), makePartoRepo(baseParto), repo)
      await app.ready()
    })

    it('should return 400 MISSING_IF_MATCH when header is absent', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/veterinarios/1', payload: {} })
      expect(res.statusCode).toBe(400)
    })

    it('should return 409 on version mismatch', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/veterinarios/1', headers: { 'If-Match': '1' }, payload: {} })
      expect(res.statusCode).toBe(409)
    })

    it('should return 200 with X-Resource-Version on success', async () => {
      const res = await app.inject({ method: 'PUT', url: '/servicios/veterinarios/1', headers: { 'If-Match': '3' }, payload: { observaciones: 'Updated' } })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('4')
    })
  })

  describe('GET X-Resource-Version headers', () => {
    beforeEach(async () => {
      app = await createTestApp(
        makePalpacionRepo(basePalpacion),
        makeInseminacionRepo(baseInseminacion),
        makePartoRepo(baseParto),
        makeVeterinarioRepo(baseVeterinario),
      )
      await app.ready()
    })

    it('should return X-Resource-Version on GET palpaciones', async () => {
      const res = await app.inject({ method: 'GET', url: '/servicios/palpaciones/1' })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('3')
    })

    it('should return X-Resource-Version on GET inseminaciones', async () => {
      const res = await app.inject({ method: 'GET', url: '/servicios/inseminaciones/1' })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('3')
    })

    it('should return X-Resource-Version on GET partos', async () => {
      const res = await app.inject({ method: 'GET', url: '/servicios/partos/1' })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('3')
    })

    it('should return X-Resource-Version on GET veterinarios', async () => {
      const res = await app.inject({ method: 'GET', url: '/servicios/veterinarios/1' })
      expect(res.statusCode).toBe(200)
      expect(res.headers['x-resource-version']).toBe('3')
    })
  })
})
