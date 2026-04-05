import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarcarLeidaUseCase } from '../application/use-cases/marcar-leida.use-case.js'
import { NOTIFICACION_REPOSITORY } from '../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../domain/repositories/notificacion.repository.js'
import { NotFoundError } from '../../../shared/errors/index.js'
import type { Notificacion } from '../domain/entities/notificacion.entity.js'

describe('MarcarLeidaUseCase', () => {
  let useCase: MarcarLeidaUseCase
  let mockRepo: INotificacionRepository

  const mockNotificacion: Notificacion = {
    id: 1,
    predioId: 1,
    usuarioId: 10,
    tipo: 'PARTO_PROXIMO',
    titulo: 'Parto próximo',
    mensaje: 'Mensaje',
    entidadTipo: 'animal',
    entidadId: 100,
    leida: 0,
    fechaEvento: new Date(),
    createdAt: new Date(),
    activo: 1,
  }

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

    useCase = new MarcarLeidaUseCase(mockRepo)
  })

  it('should mark notification as read', async () => {
    const updatedNotificacion = { ...mockNotificacion, leida: 1 }

    vi.mocked(mockRepo.findById)
      .mockResolvedValueOnce(mockNotificacion) // First call to check exists
      .mockResolvedValueOnce(updatedNotificacion) // Second call after markAsRead

    vi.mocked(mockRepo.markAsRead).mockResolvedValue(true)

    const result = await useCase.execute(1, 1)

    expect(result.leida).toBe(true)
    expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, 1)
  })

  it('should throw NotFoundError when notification does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute(999, 1)).rejects.toThrow(NotFoundError)
  })

  it('should return notification as-is if already read', async () => {
    const readNotificacion = { ...mockNotificacion, leida: 1 }
    vi.mocked(mockRepo.findById).mockResolvedValue(readNotificacion)

    const result = await useCase.execute(1, 1)

    expect(result.leida).toBe(true)
    expect(mockRepo.markAsRead).not.toHaveBeenCalled()
  })
})
