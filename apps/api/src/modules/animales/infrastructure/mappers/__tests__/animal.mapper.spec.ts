import { describe, expect, it } from 'vitest'
import { AnimalMapper, ImagenMapper } from '../animal.mapper'
import type { AnimalEntity, ImagenEntity } from '../../../domain/entities/animal.entity'

describe('AnimalMapper', () => {
  const baseAnimal: AnimalEntity = {
    id: 1,
    predioId: 1,
    codigo: 'A001',
    nombre: null,
    fechaNacimiento: null,
    fechaCompra: null,
    sexoKey: null,
    tipoIngresoId: null,
    madreId: null,
    codigoMadre: null,
    indTransferenciaEmb: null,
    codigoDonadora: null,
    tipoPadreKey: null,
    padreId: null,
    codigoPadre: null,
    codigoPajuela: null,
    configRazasId: null,
    potreroId: null,
    precioCompra: null,
    pesoCompra: null,
    codigoRfid: null,
    codigoArete: null,
    codigoQr: null,
    saludAnimalKey: null,
    estadoAnimalKey: null,
    indDescartado: null,
    activo: 1,
    createdAt: null,
    updatedAt: null,
  }

  describe('toResponse', () => {
    it('should convert animal entity to response DTO', () => {
      const animal: AnimalEntity = {
        ...baseAnimal,
        nombre: 'Test Animal',
        codigo: 'A001',
        activo: 1,
      }

      const result = AnimalMapper.toResponse(animal)

      expect(result.id).toBe(1)
      expect(result.predioId).toBe(1)
      expect(result.codigo).toBe('A001')
      expect(result.nombre).toBe('Test Animal')
    })

    it('should convert null nombre to empty string', () => {
      const animal: AnimalEntity = {
        ...baseAnimal,
        nombre: null,
      }

      const result = AnimalMapper.toResponse(animal)

      expect(result.nombre).toBe('')
    })

    it('should convert date fields to ISO string', () => {
      const date = new Date('2023-01-15T10:30:00Z')
      const animal: AnimalEntity = {
        ...baseAnimal,
        fechaNacimiento: date,
      }

      const result = AnimalMapper.toResponse(animal)

      expect(result.fechaNacimiento).toBe('2023-01-15T10:30:00.000Z')
    })

    it('should convert null date fields to null', () => {
      const animal: AnimalEntity = {
        ...baseAnimal,
        fechaNacimiento: null,
      }

      const result = AnimalMapper.toResponse(animal)

      expect(result.fechaNacimiento).toBeNull()
    })

    it('should handle all optional fields as null', () => {
      const result = AnimalMapper.toResponse(baseAnimal)

      expect(result.nombre).toBe('')
      expect(result.fechaNacimiento).toBeNull()
      expect(result.fechaCompra).toBeNull()
      expect(result.codigoMadre).toBeNull()
      expect(result.indTransferenciaEmb).toBeNull()
      expect(result.codigoDonadora).toBeNull()
      expect(result.codigoPadre).toBeNull()
      expect(result.codigoPajuela).toBeNull()
      expect(result.codigoRfid).toBeNull()
      expect(result.codigoArete).toBeNull()
      expect(result.codigoQr).toBeNull()
      expect(result.createdAt).toBeNull()
      expect(result.updatedAt).toBeNull()
    })

    it('should preserve numeric fields', () => {
      const animal: AnimalEntity = {
        ...baseAnimal,
        precioCompra: 1500.50,
        pesoCompra: 75.5,
        madreId: 10,
        configRazasId: 3,
        potreroId: 5,
      }

      const result = AnimalMapper.toResponse(animal)

      expect(result.precioCompra).toBe(1500.50)
      expect(result.pesoCompra).toBe(75.5)
      expect(result.madreId).toBe(10)
      expect(result.configRazasId).toBe(3)
      expect(result.potreroId).toBe(5)
    })
  })
})

describe('ImagenMapper', () => {
  const baseImagen: ImagenEntity = {
    id: 1,
    predioId: 1,
    ruta: '/uploads/test.jpg',
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
      }

      const result = ImagenMapper.toResponse(imagen)

      expect(result.id).toBe(1)
      expect(result.predioId).toBe(1)
      expect(result.ruta).toBe('/uploads/test.jpg')
      expect(result.nombreOriginal).toBe('test.jpg')
      expect(result.mimeType).toBe('image/jpeg')
      expect(result.tamanoBytes).toBe(1024)
    })

    it('should handle null optional fields', () => {
      const result = ImagenMapper.toResponse(baseImagen)

      expect(result.nombreOriginal).toBeNull()
      expect(result.mimeType).toBeNull()
      expect(result.tamanoBytes).toBeNull()
      expect(result.descripcion).toBeNull()
      expect(result.createdAt).toBeNull()
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
  })
})
