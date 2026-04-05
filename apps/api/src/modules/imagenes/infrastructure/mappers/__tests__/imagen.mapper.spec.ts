import { describe, expect, it } from 'vitest'
import { ImagenMapper } from '../imagen.mapper'
import type { ImagenEntity } from '../../../domain/entities/imagen.entity'

describe('ImagenMapper', () => {
  const baseImagen: ImagenEntity = {
    id: 1,
    predioId: 1,
    ruta: '/uploads/imagenes/test.jpg',
    nombreOriginal: null,
    mimeType: null,
    tamanoBytes: null,
    descripcion: null,
    activo: 1,
    createdAt: null,
  }

  describe('toResponse', () => {
    it('should convert imagen entity to response DTO', () => {
      const imagen: ImagenEntity = {
        ...baseImagen,
        nombreOriginal: 'test.jpg',
        mimeType: 'image/jpeg',
        tamanoBytes: 1024,
        descripcion: 'Test description',
      }

      const result = ImagenMapper.toResponse(imagen)

      expect(result.id).toBe(1)
      expect(result.predioId).toBe(1)
      expect(result.ruta).toBe('/uploads/imagenes/test.jpg')
      expect(result.nombreOriginal).toBe('test.jpg')
      expect(result.mimeType).toBe('image/jpeg')
      expect(result.tamanoBytes).toBe(1024)
      expect(result.descripcion).toBe('Test description')
    })

    it('should handle null optional fields', () => {
      const result = ImagenMapper.toResponse(baseImagen)

      expect(result.nombreOriginal).toBeNull()
      expect(result.mimeType).toBeNull()
      expect(result.tamanoBytes).toBeNull()
      expect(result.descripcion).toBeNull()
    })

    it('should convert createdAt to ISO string', () => {
      const date = new Date('2023-01-15T10:30:00Z')
      const imagen: ImagenEntity = {
        ...baseImagen,
        createdAt: date,
      }

      const result = ImagenMapper.toResponse(imagen)

      expect(result.createdAt).toBe('2023-01-15T10:30:00.000Z')
    })

    it('should return null for createdAt when null', () => {
      const result = ImagenMapper.toResponse(baseImagen)

      expect(result.createdAt).toBeNull()
    })
  })
})
