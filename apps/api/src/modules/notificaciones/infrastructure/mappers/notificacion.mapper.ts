import type { Notificacion } from '../../domain/entities/notificacion.entity.js'
import type { NotificacionResponseDto } from '../../application/dtos/notificacion.dto.js'

export class NotificacionMapper {
  static toResponseDto(entity: Notificacion): NotificacionResponseDto {
    return {
      id: entity.id,
      tipo: entity.tipo,
      titulo: entity.titulo,
      mensaje: entity.mensaje,
      leida: entity.leida === 1,
      fechaEvento: entity.fechaEvento ? entity.fechaEvento.toISOString() : null,
      fechaCreacion: entity.createdAt.toISOString(),
      entidadTipo: entity.entidadTipo,
      entidadId: entity.entidadId,
    }
  }

  static toDomain(row: Record<string, unknown>): Notificacion {
    return {
      id: row.id as number,
      predioId: row.predioId as number,
      usuarioId: row.usuarioId as number | null,
      tipo: row.tipo as Notificacion['tipo'],
      titulo: row.titulo as string,
      mensaje: row.mensaje as string,
      entidadTipo: row.entidadTipo as Notificacion['entidadTipo'],
      entidadId: row.entidadId as number | null,
      leida: row.leida as number,
      fechaEvento: row.fechaEvento ? new Date(row.fechaEvento as string) : null,
      createdAt: new Date(row.createdAt as string),
      activo: row.activo as number,
    }
  }
}
