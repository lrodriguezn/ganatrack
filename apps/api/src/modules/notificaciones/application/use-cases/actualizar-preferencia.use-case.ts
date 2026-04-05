import { injectable, inject } from 'tsyringe'
import { PREFERENCIA_REPOSITORY } from '../../domain/repositories/preferencia.repository.js'
import type { IPreferenciaRepository } from '../../domain/repositories/preferencia.repository.js'
import type { NotificacionTipo } from '../../domain/entities/notificacion.entity.js'
import { ValidationError } from '../../../../shared/errors/index.js'
import type { PreferenciaResponseDto, ActualizarPreferenciaBodyDto } from '../dtos/notificacion.dto.js'
import { PreferenciaMapper } from '../../infrastructure/mappers/preferencia.mapper.js'
import { NOTIFICACION_TIPOS } from '../dtos/notificacion.dto.js'

@injectable()
export class ActualizarPreferenciaUseCase {
  constructor(
    @inject(PREFERENCIA_REPOSITORY) private readonly repo: IPreferenciaRepository
  ) {}

  async execute(
    usuarioId: number,
    tipo: NotificacionTipo,
    data: ActualizarPreferenciaBodyDto
  ): Promise<PreferenciaResponseDto> {
    // Validate tipo
    if (!NOTIFICACION_TIPOS.includes(tipo)) {
      throw new ValidationError({ tipo: [`Tipo de notificación inválido: ${tipo}`] })
    }

    const preferencia = await this.repo.upsert({
      usuarioId,
      tipo,
      canalInapp: data.inapp ? 1 : 0,
      canalEmail: data.email ? 1 : 0,
      canalPush: data.push ? 1 : 0,
      diasAnticipacion: data.diasAnticipacion ?? 7,
    })

    return PreferenciaMapper.toResponseDto(preferencia)
  }
}
