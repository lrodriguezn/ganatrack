import type { PalpacionGrupalEntity, PalpacionAnimalEntity } from '../../domain/entities/palpacion.entity.js'
import type { PalpacionGrupalResponseDto, PalpacionAnimalResponseDto } from '../../application/dtos/palpacion.dto.js'

export class PalpacionGrupalMapper {
  static toResponse(e: PalpacionGrupalEntity): PalpacionGrupalResponseDto {
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

export class PalpacionAnimalMapper {
  static toResponse(e: PalpacionAnimalEntity): PalpacionAnimalResponseDto {
    return {
      id: e.id,
      palpacionGrupalId: e.palpacionGrupalId,
      animalId: e.animalId,
      veterinarioId: e.veterinarioId,
      diagnosticoId: e.diagnosticoId,
      condicionCorporalId: e.condicionCorporalId,
      fecha: e.fecha?.toISOString() ?? null,
      diasGestacion: e.diasGestacion,
      fechaParto: e.fechaParto?.toISOString() ?? null,
      comentarios: e.comentarios,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
    }
  }
}
