import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarcarTodasLeidasUseCase } from '../application/use-cases/marcar-todas-leidas.use-case.js'
import { NOTIFICACION_REPOSITORY } from '../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../domain/repositories/notificacion.repository.js'

describe('MarcarTodasLeidasUseCase', () => {
  let useCase: MarcarTodasLeidasUseCase
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

    useCase = new MarcarTodasLeidasUseCase(mockRepo)
  })

  it('should mark all notifications as read for a predio', async () => {
    vi.mocked(mockRepo.markAllAsRead).mockResolvedValue(5)

    const result = await useCase.execute(1)

    expect(result.actualizadas).toBe(5)
    expect(mockRepo.markAllAsRead).toHaveBeenCalledWith(1, undefined)
  })

  it('should filter by usuarioId when provided', async () => {
    vi.mocked(mockRepo.markAllAsRead).mockResolvedValue(3)

    const result = await useCase.execute(1, 10)

    expect(result.actualizadas).toBe(3)
    expect(mockRepo.markAllAsRead).toHaveBeenCalledWith(1, 10)
  })

  it('should return 0 when no notifications to update', async () => {
    vi.mocked(mockRepo.markAllAsRead).mockResolvedValue(0)

    const result = await useCase.execute(1)

    expect(result.actualizadas).toBe(0)
  })
})
