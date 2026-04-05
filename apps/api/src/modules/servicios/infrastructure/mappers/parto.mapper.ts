import type { PartoAnimalEntity, PartoCriaEntity } from '../../domain/entities/parto.entity.js'
import type { PartoAnimalResponseDto, PartoCriaResponseDto } from '../../application/dtos/parto.dto.js'

export class PartoAnimalMapper {
  static toResponse(e: PartoAnimalEntity): PartoAnimalResponseDto {
    return {
      id: e.id,
      predioId: e.predioId,
      animalId: e.animalId,
      fecha: e.fecha?.toISOString() ?? null,
      macho: e.macho,
      hembra: e.hembra,
      muertos: e.muertos,
      peso: e.peso,
      tipoPartoKey: e.tipoPartoKey,
      observaciones: e.observaciones,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
      crias: [],
    }
  }
}

export class PartoCriaMapper {
  static toResponse(e: PartoCriaEntity): PartoCriaResponseDto {
    return {
      id: e.id,
      partoId: e.partoId,
      criaId: e.criaId,
      sexoKey: e.sexoKey,
      pesoNacimiento: e.pesoNacimiento,
      observaciones: e.observaciones,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
    }
  }
}
