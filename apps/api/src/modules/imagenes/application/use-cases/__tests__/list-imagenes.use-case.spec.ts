import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListImagenesUseCase } from '../list-imagenes.use-case'
import type { IImagenRepository } from '../../../domain/repositories/imagen.repository'

describe('ListImagenesUseCase', () => {
  let useCase: ListImagenesUseCase
  let mockRepo: IImagenRepository

  const mockImagen = {
    id: 1,
    predioId: 1,
    ruta: '/uploads/imagenes/test.jpg',
    nombreOriginal: 'test.jpg',
    mimeType: 'image/jpeg',
    tamanoBytes: 1024,
    descripcion: null,
    activo: 1,
    createdAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue({ data: [mockImagen], total: 1 }),
      create: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new ListImagenesUseCase(mockRepo)
  })

  it('should return paginated imagenes', async () => {
    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(1)
    expect(mockRepo.findAll).toHaveBeenCalledWith(1, { page: 1, limit: 20 })
  })

  it('should return empty list when no imagenes exist', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 })

    const result = await useCase.execute(1, { page: 1, limit: 20 })

    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
  })
})
