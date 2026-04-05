import type { NotificacionPushToken } from '../../domain/entities/push-token.entity.js'
import type { PushTokenResponseDto } from '../../application/dtos/notificacion.dto.js'

export class PushTokenMapper {
  static toResponseDto(entity: NotificacionPushToken): PushTokenResponseDto {
    return {
      id: entity.id,
      token: entity.token,
      plataforma: entity.plataforma,
      createdAt: entity.createdAt.toISOString(),
    }
  }

  static toDomain(row: Record<string, unknown>): NotificacionPushToken {
    return {
      id: row.id as number,
      usuarioId: row.usuarioId as number,
      token: row.token as string,
      plataforma: row.plataforma as NotificacionPushToken['plataforma'],
      createdAt: new Date(row.createdAt as string),
      activo: row.activo as number,
    }
  }
}
