import type { VeterinarioAnimalEntity, VeterinarioGrupalEntity, VeterinarioProductoEntity } from '../../domain/entities/veterinario.entity.js'
import type { VeterinarioAnimalResponseDto, VeterinarioGrupalResponseDto, VeterinarioProductoResponseDto } from '../../application/dtos/veterinario.dto.js'

export class VeterinarioGrupalMapper {
  static toResponse(e: VeterinarioGrupalEntity): VeterinarioGrupalResponseDto {
    return {
      id: e.id,
      predioId: e.predioId,
      codigo: e.codigo,
      fecha: e.fecha?.toISOString() ?? null,
      veterinariosId: e.veterinariosId,
      tipoServicio: e.tipoServicio,
      observaciones: e.observaciones,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
      animales: [],
    }
  }
}

export class VeterinarioAnimalMapper {
  static toResponse(e: VeterinarioAnimalEntity): VeterinarioAnimalResponseDto {
    return {
      id: e.id,
      servicioGrupalId: e.servicioGrupalId,
      animalId: e.animalId,
      veterinarioId: e.veterinarioId,
      diagnosticoId: e.diagnosticoId,
      fecha: e.fecha?.toISOString() ?? null,
      tipoDiagnosticoKey: e.tipoDiagnosticoKey,
      tratamiento: e.tratamiento,
      medicamentos: e.medicamentos,
      dosis: e.dosis,
      comentarios: e.comentarios,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
      productos: [],
    }
  }
}

export class VeterinarioProductoMapper {
  static toResponse(e: VeterinarioProductoEntity): VeterinarioProductoResponseDto {
    return {
      id: e.id,
      servicioAnimalId: e.servicioAnimalId,
      productoId: e.productoId,
      cantidad: e.cantidad,
      unidad: e.unidad,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
    }
  }
}
