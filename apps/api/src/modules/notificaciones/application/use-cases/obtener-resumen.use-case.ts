import { injectable, inject } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'
import type { NotificacionResumenDto } from '../dtos/notificacion.dto.js'
import { NotificacionMapper } from '../../infrastructure/mappers/notificacion.mapper.js'

@injectable()
export class ObtenerResumenUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(predioId: number): Promise<NotificacionResumenDto> {
    const [noLeidas, porTipo] = await Promise.all([
      this.repo.countNoLeidas(predioId),
      this.repo.countByTipo(predioId),
    ])

    return {
      noLeidas,
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        count: t.count,
      })),
    }
  }
}
