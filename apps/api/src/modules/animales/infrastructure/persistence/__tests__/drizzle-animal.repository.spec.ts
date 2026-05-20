import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DrizzleAnimalRepository } from '../drizzle-animal.repository'
import type { DbClient } from '@ganatrack/database'
import type { AnimalEntity } from '../../../domain/entities/animal.entity'

describe('DrizzleAnimalRepository', () => {
  let repo: DrizzleAnimalRepository
  let capturedInsertValues: Record<string, unknown>
  let capturedUpdateSet: Record<string, unknown>

  const mockAnimal: AnimalEntity = {
    id: 1, version: 1, predioId: 1, codigo: 'A001', nombre: 'Test',
    fechaNacimiento: null, fechaCompra: null, sexoKey: null, tipoIngresoId: null,
    madreId: null, codigoMadre: null, indTransferenciaEmb: null, codigoDonadora: null,
    tipoPadreKey: null, padreId: null, codigoPadre: null, codigoPajuela: null,
    configRazasId: null, potreroId: null, precioCompra: null, pesoCompra: null,
    codigoRfid: null, codigoArete: null, codigoQr: null, saludAnimalKey: null,
    estadoAnimalKey: null, indDescartado: null, activo: 1, createdAt: null, updatedAt: null,
  }

  function createMockDb() {
    const chain: any = {}
    Object.assign(chain, {
      values: vi.fn((v: Record<string, unknown>) => { capturedInsertValues = v; return chain }),
      returning: vi.fn().mockResolvedValue([{ ...mockAnimal }]),
      set: vi.fn((s: Record<string, unknown>) => { capturedUpdateSet = s; return chain }),
      where: vi.fn().mockReturnValue(chain),
    })
    return {
      insert: vi.fn().mockReturnValue(chain),
      update: vi.fn().mockReturnValue(chain),
      select: vi.fn().mockReturnValue(chain),
      from: vi.fn().mockReturnValue(chain),
      limit: vi.fn().mockResolvedValue([]),
    }
  }

  beforeEach(() => {
    capturedInsertValues = {}
    capturedUpdateSet = {}
    const mockDb = createMockDb()
    repo = new DrizzleAnimalRepository(mockDb as unknown as DbClient)
  })

  describe('create (REQ-8)', () => {
    it('should set version=1 when creating a new animal', async () => {
      await repo.create({
        predioId: 1, codigo: 'A001', nombre: 'Test',
        fechaNacimiento: null, fechaCompra: null, sexoKey: null, tipoIngresoId: null,
        madreId: null, codigoMadre: null, indTransferenciaEmb: null, codigoDonadora: null,
        tipoPadreKey: null, padreId: null, codigoPadre: null, codigoPajuela: null,
        configRazasId: null, potreroId: null, precioCompra: null, pesoCompra: null,
        codigoRfid: null, codigoArete: null, codigoQr: null, saludAnimalKey: null,
        estadoAnimalKey: null, indDescartado: null, activo: 1,
      } as any)

      expect(capturedInsertValues.version).toBe(1)
    })
  })

  describe('update (REQ-9)', () => {
    it('should include version in update data when provided', async () => {
      await repo.update(1, { nombre: 'Updated', version: 2 })

      expect(capturedUpdateSet.version).toBe(2)
    })

    it('should include updatedAt in update data', async () => {
      await repo.update(1, { nombre: 'Updated', version: 2 })

      expect(capturedUpdateSet.updatedAt).toBeDefined()
    })
  })
})
