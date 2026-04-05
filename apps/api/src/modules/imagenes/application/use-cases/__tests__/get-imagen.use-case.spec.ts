import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetImagenUseCase } from '../get-imagen.use-case'
import type { IImagenRepository } from '../../../domain/repositories/imagen.repository'
import { NotFoundError } from '../../../../../shared/errors'

describe('GetImagenUseCase', () => {
  let useCase: GetImagenUseCase
  let mockRepo: IImagenRepository

  const mockImagen = {
    id: 1,
    predioId: 1,
    ruta: '/uploads/imagenes/test.jpg',
    nombreOriginal: 'test.jpg',
    mimeType: 'image/jpeg',
    tamanoBytes: 1024,
    descripcion: 'Test image',
    activo: 1,
    createdAt: new Date(),
  }

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn().mockResolvedValue(mockImagen),
      findAll: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    }

    useCase = new GetImagenUseCase(mockRepo)
  })

  it('should return imagen when found', async () => {
    const result = await useCase.execute(1, 1)

    expect(result.id).toBe(1)
    expect(result.ruta).toBe('/uploads/imagenes/test.jpg')
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 1)
  })

  it('should throw NotFoundError when imagen does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null)

    await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundError)
  })
})
