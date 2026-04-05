import type { InseminacionGrupalEntity, InseminacionAnimalEntity } from '../../domain/entities/inseminacion.entity.js'
import type { InseminacionGrupalResponseDto, InseminacionAnimalResponseDto } from '../../application/dtos/inseminacion.dto.js'

export class InseminacionGrupalMapper {
  static toResponse(e: InseminacionGrupalEntity): InseminacionGrupalResponseDto {
    return {
      id: e.id,
      predioId: e.predioId,
      codigo: e.codigo,
      fecha: e.fecha?.toISOString() ?? null,
      veterinariosId: e.veterinariosId,
      observaciones: e.observaciones,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
      animales: [],
    }
  }
}

export class InseminacionAnimalMapper {
  static toResponse(e: InseminacionAnimalEntity): InseminacionAnimalResponseDto {
    return {
      id: e.id,
      inseminacionGrupalId: e.inseminacionGrupalId,
      animalId: e.animalId,
      veterinarioId: e.veterinarioId,
      fecha: e.fecha?.toISOString() ?? null,
      tipoInseminacionKey: e.tipoInseminacionKey,
      codigoPajuela: e.codigoPajuela,
      diagnosticoId: e.diagnosticoId,
      observaciones: e.observaciones,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
    }
  }
}
