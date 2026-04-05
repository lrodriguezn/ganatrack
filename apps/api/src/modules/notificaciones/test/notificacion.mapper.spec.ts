import { describe, it, expect } from 'vitest'
import { NotificacionMapper } from '../infrastructure/mappers/notificacion.mapper.js'
import type { Notificacion } from '../domain/entities/notificacion.entity.js'

describe('NotificacionMapper', () => {
  describe('toResponseDto', () => {
    it('should convert entity to response DTO', () => {
      const entity: Notificacion = {
        id: 1,
        predioId: 1,
        usuarioId: 10,
        tipo: 'PARTO_PROXIMO',
        titulo: 'Parto próximo',
        mensaje: 'El animal A001 tiene parto esperado',
        entidadTipo: 'animal',
        entidadId: 100,
        leida: 0,
        fechaEvento: new Date('2026-04-10T00:00:00.000Z'),
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        activo: 1,
      }

      const dto = NotificacionMapper.toResponseDto(entity)

      expect(dto.id).toBe(1)
      expect(dto.tipo).toBe('PARTO_PROXIMO')
      expect(dto.titulo).toBe('Parto próximo')
      expect(dto.leida).toBe(false)
      expect(dto.fechaEvento).toBe('2026-04-10T00:00:00.000Z')
      expect(dto.fechaCreacion).toBe('2026-04-05T10:00:00.000Z')
      expect(dto.entidadTipo).toBe('animal')
      expect(dto.entidadId).toBe(100)
    })

    it('should handle null fechaEvento', () => {
      const entity: Notificacion = {
        id: 1,
        predioId: 1,
        usuarioId: 10,
        tipo: 'PARTO_PROXIMO',
        titulo: 'Test',
        mensaje: 'Test',
        entidadTipo: null,
        entidadId: null,
        leida: 1,
        fechaEvento: null,
        createdAt: new Date('2026-04-05T10:00:00.000Z'),
        activo: 1,
      }

      const dto = NotificacionMapper.toResponseDto(entity)

      expect(dto.fechaEvento).toBeNull()
      expect(dto.leida).toBe(true)
    })
  })
})
