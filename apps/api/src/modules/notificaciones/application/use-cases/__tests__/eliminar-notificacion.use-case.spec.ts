import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EliminarNotificacionUseCase } from '../eliminar-notificacion.use-case.js'
import { NOTIFICACION_REPOSITORY } from '../../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../../domain/repositories/notificacion.repository.js'
import { NotFoundError } from '../../../../../shared/errors/index.js'
import type { Notificacion } from '../../../domain/entities/notificacion.entity.js'

describe('EliminarNotificacionUseCase', () => {
  let useCase: EliminarNotificacionUseCase
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

    useCase = new EliminarNotificacionUseCase(mockRepo)
  })

  describe('execute', () => {
    it('should soft delete notification successfully', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(mockNotificacion)
      vi.mocked(mockRepo.softDelete).mockResolvedValue(true)

      await useCase.execute(1, 1)

      expect(mockRepo.findById).toHaveBeenCalledWith(1, 1)
      expect(mockRepo.softDelete).toHaveBeenCalledWith(1, 1)
    })

    it('should throw NotFoundError if notification does not exist', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      await expect(useCase.execute(999, 1)).rejects.toThrow(NotFoundError)
      await expect(useCase.execute(999, 1)).rejects.toThrow('Notificación con id 999 no existe')
    })

    it('should throw NotFoundError if notification belongs to different predio', async () => {
      // When findById is called with id=1, predioId=1, it returns null because
      // the notification exists but belongs to predioId=2
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      await expect(useCase.execute(1, 1)).rejects.toThrow(NotFoundError)
      await expect(useCase.execute(1, 1)).rejects.toThrow('Notificación con id 1 no existe')
    })
  })
})