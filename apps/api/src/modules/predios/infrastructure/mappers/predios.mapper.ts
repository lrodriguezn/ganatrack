import type { PredioEntity } from '../../domain/entities/predio.entity.js'
import type { PotreroEntity } from '../../domain/entities/potrero.entity.js'
import type { SectorEntity } from '../../domain/entities/sector.entity.js'
import type { LoteEntity } from '../../domain/entities/lote.entity.js'
import type { GrupoEntity } from '../../domain/entities/grupo.entity.js'
import type { ConfigParametroPredioEntity } from '../../domain/entities/config-parametro-predio.entity.js'
import type {
  ConfigParametroPredioResponseDto,
  GrupoResponseDto,
  LoteResponseDto,
  PotreroResponseDto,
  PredioResponseDto,
  SectorResponseDto,
} from '../../application/dtos/predios.dto.js'

export class PredioMapper {
  static toResponse(entity: PredioEntity): PredioResponseDto {
    return {
      id: entity.id,
      codigo: entity.codigo,
      nombre: entity.nombre,
      departamento: entity.departamento,
      municipio: entity.municipio,
      vereda: entity.vereda,
      areaHectareas: entity.areaHectareas,
      capacidadMaxima: entity.capacidadMaxima,
      tipoExplotacionId: entity.tipoExplotacionId,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class PotreroMapper {
  static toResponse(entity: PotreroEntity): PotreroResponseDto {
    return {
      id: entity.id,
      predioId: entity.predioId,
      codigo: entity.codigo,
      nombre: entity.nombre,
      areaHectareas: entity.areaHectareas,
      tipoPasto: entity.tipoPasto,
      capacidadMaxima: entity.capacidadMaxima,
      estado: entity.estado,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class SectorMapper {
  static toResponse(entity: SectorEntity): SectorResponseDto {
    return {
      id: entity.id,
      predioId: entity.predioId,
      codigo: entity.codigo,
      nombre: entity.nombre,
      areaHectareas: entity.areaHectareas,
      tipoPasto: entity.tipoPasto,
      capacidadMaxima: entity.capacidadMaxima,
      estado: entity.estado,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class LoteMapper {
  static toResponse(entity: LoteEntity): LoteResponseDto {
    return {
      id: entity.id,
      predioId: entity.predioId,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      tipo: entity.tipo,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class GrupoMapper {
  static toResponse(entity: GrupoEntity): GrupoResponseDto {
    return {
      id: entity.id,
      predioId: entity.predioId,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigParametroPredioMapper {
  static toResponse(entity: ConfigParametroPredioEntity): ConfigParametroPredioResponseDto {
    return {
      id: entity.id,
      predioId: entity.predioId,
      codigo: entity.codigo,
      valor: entity.valor,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}
