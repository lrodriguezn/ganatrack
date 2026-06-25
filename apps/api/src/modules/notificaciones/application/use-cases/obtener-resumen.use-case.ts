import { inject, injectable } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'
import type { NotificacionResumenDto } from '../dtos/notificacion.dto.js'
import { NotificacionMapper } from '../../infrastructure/mappers/notificacion.mapper.js'

/**
 * Cap for the `ultimas` preview array in the resumen response.
 * The repository enforces the limit via the `limit` query option;
 * the use case is a pass-through. Keep these in sync.
 */
const ULTIMAS_LIMIT = 5

@injectable()
export class ObtenerResumenUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(predioId: number): Promise<NotificacionResumenDto> {
    const [noLeidas, porTipo, ultimasPage] = await Promise.all([
      this.repo.countNoLeidas(predioId),
      this.repo.countByTipo(predioId),
      this.repo.findByPredio(predioId, { page: 1, limit: ULTIMAS_LIMIT }),
    ])

    return {
      noLeidas,
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        count: t.count,
      })),
      ultimas: ultimasPage.data.map(NotificacionMapper.toResponseDto),
    }
  }
}
