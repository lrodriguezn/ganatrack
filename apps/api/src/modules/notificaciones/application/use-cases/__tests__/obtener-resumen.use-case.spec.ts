import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObtenerResumenUseCase } from '../obtener-resumen.use-case.js'
import { NOTIFICACION_REPOSITORY } from '../../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../../domain/repositories/notificacion.repository.js'

describe('ObtenerResumenUseCase', () => {
  let useCase: ObtenerResumenUseCase
  let mockRepo: INotificacionRepository

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByPredio: vi.fn(),
      countByTipo: vi.fn(),
      countNoLeidas: vi.fn(),
      create: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      softDelete: vi.fn(),
      existsSimilar: vi.fn(),
    }

    useCase = new ObtenerResumenUseCase(mockRepo)
  })

  describe('execute', () => {
    it('should return notification summary (happy path)', async () => {
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(5)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([
        { tipo: 'PARTO_PROXIMO', count: 2 },
        { tipo: 'CELO_ESTIMADO', count: 1 },
        { tipo: 'VACUNA_PENDIENTE', count: 2 },
      ])
      vi.mocked(mockRepo.findByPredio).mockResolvedValue({
        data: [],
        total: 0,
      })

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(5)
      expect(result.porTipo).toEqual([
        { tipo: 'PARTO_PROXIMO', count: 2 },
        { tipo: 'CELO_ESTIMADO', count: 1 },
        { tipo: 'VACUNA_PENDIENTE', count: 2 },
      ])
      expect(result.ultimas).toEqual([])
      expect(mockRepo.countNoLeidas).toHaveBeenCalledWith(1)
      expect(mockRepo.countByTipo).toHaveBeenCalledWith(1)
      expect(mockRepo.findByPredio).toHaveBeenCalledWith(1, { page: 1, limit: 5 })
    })

    it('should return zero counts when no notifications', async () => {
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(0)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([])
      vi.mocked(mockRepo.findByPredio).mockResolvedValue({
        data: [],
        total: 0,
      })

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(0)
      expect(result.porTipo).toEqual([])
      expect(result.ultimas).toEqual([])
    })

    it('should handle user with predio context', async () => {
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(3)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([
        { tipo: 'PARTO_PROXIMO', count: 3 },
      ])
      vi.mocked(mockRepo.findByPredio).mockResolvedValue({
        data: [],
        total: 0,
      })

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(3)
      expect(result.porTipo).toEqual([{ tipo: 'PARTO_PROXIMO', count: 3 }])
      expect(mockRepo.countNoLeidas).toHaveBeenCalledWith(1)
    })

    it('should call findByPredio with page 1 and limit 5 and map items newest-first', async () => {
      // Drizzle's findByPredio already orders desc(createdAt); the use case
      // trusts that ordering and maps each item to its response DTO.
      const baseRow = {
        id: 0,
        predioId: 1,
        usuarioId: 1,
        tipo: 'PARTO_PROXIMO' as const,
        titulo: '',
        mensaje: '',
        entidadTipo: null,
        entidadId: null,
        leida: 0,
        fechaEvento: null,
        activo: 1,
      }
      const newer = new Date('2026-06-24T10:00:00Z')
      const older = new Date('2026-06-24T09:00:00Z')
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(2)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([
        { tipo: 'PARTO_PROXIMO', count: 2 },
      ])
      vi.mocked(mockRepo.findByPredio).mockResolvedValue({
        data: [
          { ...baseRow, id: 2, titulo: 'newer', createdAt: newer },
          { ...baseRow, id: 1, titulo: 'older', createdAt: older },
        ],
        total: 2,
      })

      const result = await useCase.execute(1)

      // result.ultimas preserves repository ordering (newest first)
      expect(result.ultimas).toHaveLength(2)
      expect(result.ultimas[0]).toMatchObject({ id: 2, titulo: 'newer', fechaCreacion: newer.toISOString() })
      expect(result.ultimas[1]).toMatchObject({ id: 1, titulo: 'older', fechaCreacion: older.toISOString() })
      expect(mockRepo.findByPredio).toHaveBeenCalledWith(1, { page: 1, limit: 5 })
    })

    it('should cap ultimas to 5 items (enforced by repository limit)', async () => {
      const baseRow = {
        id: 0,
        predioId: 1,
        usuarioId: 1,
        tipo: 'PARTO_PROXIMO' as const,
        titulo: '',
        mensaje: '',
        entidadTipo: null,
        entidadId: null,
        leida: 0,
        fechaEvento: null,
        activo: 1,
      }
      const fiveRows = Array.from({ length: 5 }, (_, i) => ({
        ...baseRow,
        id: 100 + i,
        titulo: `n${i}`,
        createdAt: new Date(2026, 0, 1, 0, 5 - i),
      }))
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(5)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([
        { tipo: 'PARTO_PROXIMO', count: 5 },
      ])
      vi.mocked(mockRepo.findByPredio).mockResolvedValue({ data: fiveRows, total: 5 })

      const result = await useCase.execute(1)

      expect(result.ultimas.length).toBeLessThanOrEqual(5)
      expect(result.ultimas.length).toBe(5)
    })
  })
})