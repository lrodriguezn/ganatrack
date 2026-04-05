import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActualizarPreferenciaUseCase } from '../actualizar-preferencia.use-case.js'
import { PREFERENCIA_REPOSITORY } from '../../../domain/repositories/preferencia.repository.js'
import type { IPreferenciaRepository } from '../../../domain/repositories/preferencia.repository.js'
import { ValidationError } from '../../../../../shared/errors/index.js'
import type { NotificacionPreferencia } from '../../../domain/entities/preferencia.entity.js'

describe('ActualizarPreferenciaUseCase', () => {
  let useCase: ActualizarPreferenciaUseCase
  let mockRepo: IPreferenciaRepository

  const mockPreferencia: NotificacionPreferencia = {
    id: 1,
    usuarioId: 10,
    tipo: 'PARTO_PROXIMO',
    canalInapp: 1,
    canalEmail: 0,
    canalPush: 1,
    diasAnticipacion: 7,
    activo: 1,
  }

  beforeEach(() => {
    mockRepo = {
      findByUsuario: vi.fn(),
      findByUsuarioAndTipo: vi.fn(),
      upsert: vi.fn(),
      getDefaultsForUsuario: vi.fn(),
    }

    useCase = new ActualizarPreferenciaUseCase(mockRepo)
  })

  it('should update preference successfully', async () => {
    const body = { inapp: true, email: false, push: true, diasAnticipacion: 5 }

    vi.mocked(mockRepo.upsert).mockResolvedValue({
      ...mockPreferencia,
      canalEmail: 0,
      diasAnticipacion: 5,
    })

    const result = await useCase.execute(10, 'PARTO_PROXIMO', body)

    expect(result.tipo).toBe('PARTO_PROXIMO')
    expect(result.canal.inapp).toBe(true)
    expect(result.canal.email).toBe(false)
    expect(result.canal.push).toBe(true)
    expect(result.diasAnticipacion).toBe(5)
    expect(mockRepo.upsert).toHaveBeenCalledWith({
      usuarioId: 10,
      tipo: 'PARTO_PROXIMO',
      canalInapp: 1,
      canalEmail: 0,
      canalPush: 1,
      diasAnticipacion: 5,
    })
  })

  it('should throw ValidationError for invalid tipo', async () => {
    const body = { inapp: true, email: false, push: true }

    await expect(
      useCase.execute(10, 'INVALID_TYPE' as any, body)
    ).rejects.toThrow(ValidationError)
  })

  it('should use default diasAnticipacion if not provided', async () => {
    const body = { inapp: true, email: true, push: false }

    vi.mocked(mockRepo.upsert).mockResolvedValue(mockPreferencia)

    await useCase.execute(10, 'PARTO_PROXIMO', body)

    expect(mockRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        diasAnticipacion: 7,
      })
    )
  })
})
