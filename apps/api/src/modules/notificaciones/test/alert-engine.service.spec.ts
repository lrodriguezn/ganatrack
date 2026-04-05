import { describe, it, expect, beforeEach } from 'vitest'
import { AlertEngineService } from '../domain/services/alert-engine.service.js'

describe('AlertEngineService', () => {
  let service: AlertEngineService

  beforeEach(() => {
    service = new AlertEngineService()
  })

  describe('buildTituloPartoProximo', () => {
    it('should return "Parto esperado hoy" when diasRestantes is 0', () => {
      const result = service.buildTituloPartoProximo('A001', 0)
      expect(result).toBe('Parto esperado hoy — Animal A001')
    })

    it('should return "Parto mañana" when diasRestantes is 1', () => {
      const result = service.buildTituloPartoProximo('A002', 1)
      expect(result).toBe('Parto mañana — Animal A002')
    })

    it('should return days remaining when diasRestantes > 1', () => {
      const result = service.buildTituloPartoProximo('A003', 5)
      expect(result).toBe('Parto en 5 días — Animal A003')
    })
  })

  describe('buildTituloCeloEstimado', () => {
    it('should build correct title for celo estimado', () => {
      const result = service.buildTituloCeloEstimado('A001')
      expect(result).toBe('Celo estimado — Animal A001')
    })
  })

  describe('buildTituloInseminacionPendiente', () => {
    it('should include days pending in title', () => {
      const result = service.buildTituloInseminacionPendiente('A001', 15)
      expect(result).toBe('Inseminación pendiente — Animal A001 (15 días)')
    })
  })

  describe('buildTituloVacunaPendiente', () => {
    it('should include tratamiento and animal code', () => {
      const result = service.buildTituloVacunaPendiente('A001', 'Vacuna Bravo')
      expect(result).toBe('Vacuna próxima — Vacuna Bravo Animal A001')
    })

    it('should handle null tratamiento', () => {
      const result = service.buildTituloVacunaPendiente('A001', null)
      expect(result).toBe('Vacuna próxima — Tratamiento Animal A001')
    })
  })

  describe('buildTituloAnimalEnfermo', () => {
    it('should build correct title for sick animal', () => {
      const result = service.buildTituloAnimalEnfermo('A001')
      expect(result).toBe('Animal enfermo sin atención — A001')
    })
  })

  describe('evaluarAlertas', () => {
    it('should return empty array (stub implementation)', async () => {
      const ctx = {
        predioId: 1,
        fechaReferencia: new Date(),
        diasAnticipacion: 7,
      }

      const result = await service.evaluarAlertas(ctx)
      expect(result).toEqual([])
    })
  })
})
