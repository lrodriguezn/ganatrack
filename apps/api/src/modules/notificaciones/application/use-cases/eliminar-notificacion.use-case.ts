import { inject, injectable } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class EliminarNotificacionUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const notificacion = await this.repo.findById(id, predioId)

    if (!notificacion) {
      throw new NotFoundError('Notificación', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
