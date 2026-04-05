import type { NotificacionPreferencia } from '../../domain/entities/preferencia.entity.js'
import type { PreferenciaResponseDto } from '../../application/dtos/notificacion.dto.js'

export class PreferenciaMapper {
  static toResponseDto(entity: NotificacionPreferencia): PreferenciaResponseDto {
    return {
      tipo: entity.tipo,
      canal: {
        inapp: entity.canalInapp === 1,
        email: entity.canalEmail === 1,
        push: entity.canalPush === 1,
      },
      diasAnticipacion: entity.diasAnticipacion,
    }
  }

  static toDomain(row: Record<string, unknown>): NotificacionPreferencia {
    return {
      id: row.id as number,
      usuarioId: row.usuarioId as number,
      tipo: row.tipo as NotificacionPreferencia['tipo'],
      canalInapp: row.canalInapp as number,
      canalEmail: row.canalEmail as number,
      canalPush: row.canalPush as number,
      diasAnticipacion: row.diasAnticipacion as number,
      activo: row.activo as number,
    }
  }
}
