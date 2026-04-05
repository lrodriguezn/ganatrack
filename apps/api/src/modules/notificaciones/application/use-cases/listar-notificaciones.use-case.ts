import { injectable, inject } from 'tsyringe'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository, ListNotificacionesOptions } from '../../domain/repositories/notificacion.repository.js'
import type { NotificacionTipo } from '../../domain/entities/notificacion.entity.js'
import type { NotificacionResponseDto, PaginatedResponse } from '../dtos/notificacion.dto.js'
import { NotificacionMapper } from '../../infrastructure/mappers/notificacion.mapper.js'

@injectable()
export class ListarNotificacionesUseCase {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async execute(
    predioId: number,
    opts: ListNotificacionesOptions
  ): Promise<PaginatedResponse<NotificacionResponseDto>> {
    const { page, limit, leida, tipo } = opts

    const result = await this.repo.findByPredio(predioId, {
      page: page ?? 1,
      limit: limit ?? 20,
      leida,
      tipo,
    })

    return {
      data: result.data.map(n => NotificacionMapper.toResponseDto(n)),
      meta: {
        page,
        limit,
        total: result.total,
      },
    }
  }
}
