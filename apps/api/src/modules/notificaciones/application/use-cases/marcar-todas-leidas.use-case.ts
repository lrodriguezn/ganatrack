import { injectable, inject } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'

export interface MarcarTodasLeidasResult {
  actualizadas: number
}

@injectable()
export class MarcarTodasLeidasUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(predioId: number, usuarioId?: number): Promise<MarcarTodasLeidasResult> {
    const actualizadas = await this.repo.markAllAsRead(predioId, usuarioId)

    return {
      actualizadas,
    }
  }
}
