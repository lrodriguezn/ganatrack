import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ObtenerPreferenciasUseCase } from '../obtener-preferencias.use-case.js'
import { PREFERENCIA_REPOSITORY } from '../../../domain/repositories/preferencia.repository.js'
import type { IPreferenciaRepository } from '../../../domain/repositories/preferencia.repository.js'
import type { NotificacionPreferencia } from '../../../domain/entities/preferencia.entity.js'

describe('ObtenerPreferenciasUseCase', () => {
  let useCase: ObtenerPreferenciasUseCase
  let mockRepo: IPreferenciaRepository

  const mockPreferencias: NotificacionPreferencia[] = [
    {
      id: 1,
      usuarioId: 10,
      tipo: 'PARTO_PROXIMO',
      canalInapp: 1,
      canalEmail: 0,
      canalPush: 1,
      diasAnticipacion: 7,
      activo: 1,
    },
    {
      id: 2,
      usuarioId: 10,
      tipo: 'CELO_ESTIMADO',
      canalInapp: 1,
      canalEmail: 1,
      canalPush: 0,
      diasAnticipacion: 3,
      activo: 1,
    },
  ]

  beforeEach(() => {
    mockRepo = {
      findByUsuario: vi.fn(),
      findByUsuarioAndTipo: vi.fn(),
      upsert: vi.fn(),
      getDefaultsForUsuario: vi.fn(),
    }

    useCase = new ObtenerPreferenciasUseCase(mockRepo)
  })

  describe('execute', () => {
    it('should return user preferences (happy path)', async () => {
      vi.mocked(mockRepo.findByUsuario).mockResolvedValue(mockPreferencias)

      const result = await useCase.execute(10)

      // Use case returns all 5 notification types
      expect(result).toHaveLength(5)
      
      // Check that PARTO_PROXIMO and CELO_ESTIMADO have the configured values
      const partoProximo = result.find(p => p.tipo === 'PARTO_PROXIMO')
      expect(partoProximo).toBeDefined()
      expect(partoProximo!.canal.inapp).toBe(true)
      expect(partoProximo!.canal.email).toBe(false)
      expect(partoProximo!.canal.push).toBe(true)
      
      const celoEstimado = result.find(p => p.tipo === 'CELO_ESTIMADO')
      expect(celoEstimado).toBeDefined()
      expect(celoEstimado!.canal.inapp).toBe(true)
      expect(celoEstimado!.canal.email).toBe(true)
      expect(celoEstimado!.canal.push).toBe(false)
    })

    it('should return default preferences if user has no preferences', async () => {
      vi.mocked(mockRepo.findByUsuario).mockResolvedValue([])

      const result = await useCase.execute(10)

      // Use case returns all 5 notification types with default values
      expect(result).toHaveLength(5)
      // All should have default canal values
      result.forEach(pref => {
        expect(pref.canal.inapp).toBe(true)
        expect(pref.canal.email).toBe(true)
        expect(pref.canal.push).toBe(false)
        expect(pref.diasAnticipacion).toBe(7)
      })
    })

    it('should return all 5 notification types with preferences or defaults', async () => {
      const preferencesWithInactive: NotificacionPreferencia[] = [
        ...mockPreferencias,
        {
          id: 3,
          usuarioId: 10,
          tipo: 'VACUNA_PENDIENTE',
          canalInapp: 0,
          canalEmail: 0,
          canalPush: 0,
          diasAnticipacion: 5,
          activo: 0,
        },
      ]

      vi.mocked(mockRepo.findByUsuario).mockResolvedValue(preferencesWithInactive)

      const result = await useCase.execute(10)

      // Use case returns all 5 notification types, merging with defaults
      expect(result).toHaveLength(5)
      // Should include all types: PARTO_PROXIMO, CELO_ESTIMADO, INSEMINACION_PENDIENTE, VACUNA_PENDIENTE, ANIMAL_ENFERMO
      expect(result.map(p => p.tipo)).toContain('PARTO_PROXIMO')
      expect(result.map(p => p.tipo)).toContain('VACUNA_PENDIENTE')
    })
  })
})