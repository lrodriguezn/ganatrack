import type { ConfigRazaEntity } from '../../domain/entities/config-raza.entity.js'
import type { ConfigCondicionCorporalEntity } from '../../domain/entities/config-condicion-corporal.entity.js'
import type { ConfigTipoExplotacionEntity } from '../../domain/entities/config-tipo-explotacion.entity.js'
import type { ConfigCalidadAnimalEntity } from '../../domain/entities/config-calidad-animal.entity.js'
import type { ConfigColorEntity } from '../../domain/entities/config-color.entity.js'
import type { ConfigRangoEdadEntity } from '../../domain/entities/config-rango-edad.entity.js'
import type { ConfigKeyValueEntity } from '../../domain/entities/config-key-value.entity.js'
import type {
  ConfigRazaResponseDto,
  ConfigCondicionCorporalResponseDto,
  ConfigTipoExplotacionResponseDto,
  ConfigCalidadAnimalResponseDto,
  ConfigColorResponseDto,
  ConfigRangoEdadResponseDto,
  ConfigKeyValueResponseDto,
} from '../../application/dtos/configuracion.dto.js'

export class ConfigRazaMapper {
  static toResponse(entity: ConfigRazaEntity): ConfigRazaResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      origen: entity.origen,
      tipoProduccion: entity.tipoProduccion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigCondicionCorporalMapper {
  static toResponse(entity: ConfigCondicionCorporalEntity): ConfigCondicionCorporalResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      valorMin: entity.valorMin,
      valorMax: entity.valorMax,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigTipoExplotacionMapper {
  static toResponse(entity: ConfigTipoExplotacionEntity): ConfigTipoExplotacionResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigCalidadAnimalMapper {
  static toResponse(entity: ConfigCalidadAnimalEntity): ConfigCalidadAnimalResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigColorMapper {
  static toResponse(entity: ConfigColorEntity): ConfigColorResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      codigo: entity.codigo,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigRangoEdadMapper {
  static toResponse(entity: ConfigRangoEdadEntity): ConfigRangoEdadResponseDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      rango1: entity.rango1,
      rango2: entity.rango2,
      sexo: entity.sexo,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ConfigKeyValueMapper {
  static toResponse(entity: ConfigKeyValueEntity): ConfigKeyValueResponseDto {
    return {
      id: entity.id,
      opcion: entity.opcion,
      key: entity.key,
      value: entity.value,
      descripcion: entity.descripcion,
      activo: entity.activo,
      createdAt: entity.createdAt?.toISOString() ?? null,
      updatedAt: entity.updatedAt?.toISOString() ?? null,
    }
  }
}
