import { injectable, inject } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { NotificacionResponseDto } from '../dtos/notificacion.dto.js'
import { NotificacionMapper } from '../../infrastructure/mappers/notificacion.mapper.js'

@injectable()
export class MarcarLeidaUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(id: number, predioId: number): Promise<NotificacionResponseDto> {
    const notificacion = await this.repo.findById(id, predioId)

    if (!notificacion) {
      throw new NotFoundError('Notificación', id)
    }

    if (notificacion.leida === 1) {
      // Already read, return as-is
      return NotificacionMapper.toResponseDto(notificacion)
    }

    const updated = await this.repo.markAsRead(id, predioId)

    if (!updated) {
      throw new NotFoundError('Notificación', id)
    }

    const refreshed = await this.repo.findById(id, predioId)
    return NotificacionMapper.toResponseDto(refreshed!)
  }
}
