import type { ImagenEntity } from '../../domain/entities/imagen.entity.js'
import type { ImagenResponseDto } from '../../application/dtos/imagen.dto.js'

export class ImagenMapper {
  static toResponse(e: ImagenEntity): ImagenResponseDto {
    return {
      id: e.id,
      predioId: e.predioId,
      ruta: e.ruta,
      nombreOriginal: e.nombreOriginal,
      mimeType: e.mimeType,
      tamanoBytes: e.tamanoBytes,
      descripcion: e.descripcion,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
    }
  }
}
