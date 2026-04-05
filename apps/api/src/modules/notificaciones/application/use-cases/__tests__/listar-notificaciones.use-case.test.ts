import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListarNotificacionesUseCase } from '../listar-notificaciones.use-case.js'
import { NOTIFICACION_REPOSITORY } from '../../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../../domain/repositories/notificacion.repository.js'
import type { Notificacion } from '../../../domain/entities/notificacion.entity.js'

describe('ListarNotificacionesUseCase', () => {
  let useCase: ListarNotificacionesUseCase
  let mockRepo: INotificacionRepository

  const mockNotificacion: Notificacion = {
    id: 1,
    predioId: 1,
    usuarioId: 10,
    tipo: 'PARTO_PROXIMO',
    titulo: 'Parto próximo — Animal A001',
    mensaje: 'El animal A001 tiene un parto estimado',
    entidadTipo: 'animal',
    entidadId: 100,
    leida: 0,
    fechaEvento: new Date('2026-04-10'),
    createdAt: new Date(),
    activo: 1,
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByPredio: vi.fn().mockResolvedValue({
        data: [mockNotificacion],
        total: 1,
      }),
      countByTipo: vi.fn(),
      countNoLeidas: vi.fn(),
      create: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      softDelete: vi.fn(),
      existsSimilar: vi.fn(),
    }

    useCase = new ListarNotificacionesUseCase(mockRepo)
  })

  it('should return paginated notifications', async () => {
    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toBeDefined()
    if (result.data[0]) {
      expect(result.data[0].id).toBe(1)
      expect(result.data[0].tipo).toBe('PARTO_PROXIMO')
      expect(result.data[0].leida).toBe(false)
    }
    expect(result.meta.page).toBe(1)
    expect(result.meta.limit).toBe(20)
    expect(result.meta.total).toBe(1)
  })

  it('should filter by leida status', async () => {
    await useCase.execute(1, { page: 1, limit: 20, leida: 0 })

    expect(mockRepo.findByPredio).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 20,
      leida: 0,
      tipo: undefined,
    })
  })

  it('should filter by tipo', async () => {
    await useCase.execute(1, { page: 1, limit: 20, tipo: 'PARTO_PROXIMO' })

    expect(mockRepo.findByPredio).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 20,
      leida: undefined,
      tipo: 'PARTO_PROXIMO',
    })
  })

  it('should use default pagination values', async () => {
    await useCase.execute(1, { page: 1, limit: 20 })

    expect(mockRepo.findByPredio).toHaveBeenCalledWith(1, {
      page: 1,
      limit: 20,
      leida: undefined,
      tipo: undefined,
    })
  })
})
