import { describe, it, expect } from 'vitest'
import { PreferenciaMapper } from '../infrastructure/mappers/preferencia.mapper.js'
import type { NotificacionPreferencia } from '../domain/entities/preferencia.entity.js'

describe('PreferenciaMapper', () => {
  describe('toResponseDto', () => {
    it('should convert entity to response DTO', () => {
      const entity: NotificacionPreferencia = {
        id: 1,
        usuarioId: 10,
        tipo: 'PARTO_PROXIMO',
        canalInapp: 1,
        canalEmail: 0,
        canalPush: 1,
        diasAnticipacion: 7,
        activo: 1,
      }

      const dto = PreferenciaMapper.toResponseDto(entity)

      expect(dto.tipo).toBe('PARTO_PROXIMO')
      expect(dto.canal.inapp).toBe(true)
      expect(dto.canal.email).toBe(false)
      expect(dto.canal.push).toBe(true)
      expect(dto.diasAnticipacion).toBe(7)
    })

    it('should convert all canal flags correctly', () => {
      const entity: NotificacionPreferencia = {
        id: 1,
        usuarioId: 10,
        tipo: 'CELO_ESTIMADO',
        canalInapp: 0,
        canalEmail: 0,
        canalPush: 0,
        diasAnticipacion: 3,
        activo: 1,
      }

      const dto = PreferenciaMapper.toResponseDto(entity)

      expect(dto.canal.inapp).toBe(false)
      expect(dto.canal.email).toBe(false)
      expect(dto.canal.push).toBe(false)
    })
  })
})
