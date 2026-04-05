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

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(5)
      expect(result.porTipo).toEqual([
        { tipo: 'PARTO_PROXIMO', count: 2 },
        { tipo: 'CELO_ESTIMADO', count: 1 },
        { tipo: 'VACUNA_PENDIENTE', count: 2 },
      ])
      expect(mockRepo.countNoLeidas).toHaveBeenCalledWith(1)
      expect(mockRepo.countByTipo).toHaveBeenCalledWith(1)
    })

    it('should return zero counts when no notifications', async () => {
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(0)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([])

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(0)
      expect(result.porTipo).toEqual([])
    })

    it('should handle user with predio context', async () => {
      vi.mocked(mockRepo.countNoLeidas).mockResolvedValue(3)
      vi.mocked(mockRepo.countByTipo).mockResolvedValue([
        { tipo: 'PARTO_PROXIMO', count: 3 },
      ])

      const result = await useCase.execute(1)

      expect(result.noLeidas).toBe(3)
      expect(result.porTipo).toEqual([{ tipo: 'PARTO_PROXIMO', count: 3 }])
      expect(mockRepo.countNoLeidas).toHaveBeenCalledWith(1)
    })
  })
})