import type { VeterinarioEntity } from '../../domain/entities/veterinario.entity.js'
import type { PropietarioEntity } from '../../domain/entities/propietario.entity.js'
import type { HierroEntity } from '../../domain/entities/hierro.entity.js'
import type { DiagnosticoVeterinarioEntity } from '../../domain/entities/diagnostico-veterinario.entity.js'
import type { MotivoVentaEntity } from '../../domain/entities/motivo-venta.entity.js'
import type { CausaMuerteEntity } from '../../domain/entities/causa-muerte.entity.js'
import type { LugarCompraEntity } from '../../domain/entities/lugar-compra.entity.js'
import type { LugarVentaEntity } from '../../domain/entities/lugar-venta.entity.js'
import type {
  CausaMuerteResponseDto, DiagnosticoVeterinarioResponseDto, HierroResponseDto,
  LugarCompraResponseDto, LugarVentaResponseDto, MotivoVentaResponseDto,
  PropietarioResponseDto, VeterinarioResponseDto,
} from '../../application/dtos/maestros.dto.js'

export class VeterinarioMapper {
  static toResponse(e: VeterinarioEntity): VeterinarioResponseDto {
    return { id: e.id, predioId: e.predioId, nombre: e.nombre, telefono: e.telefono, email: e.email, direccion: e.direccion, numeroRegistro: e.numeroRegistro, especialidad: e.especialidad, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class PropietarioMapper {
  static toResponse(e: PropietarioEntity): PropietarioResponseDto {
    return { id: e.id, predioId: e.predioId, nombre: e.nombre, tipoDocumento: e.tipoDocumento, numeroDocumento: e.numeroDocumento, telefono: e.telefono, email: e.email, direccion: e.direccion, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class HierroMapper {
  static toResponse(e: HierroEntity): HierroResponseDto {
    return { id: e.id, predioId: e.predioId, nombre: e.nombre, descripcion: e.descripcion, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class DiagnosticoVeterinarioMapper {
  static toResponse(e: DiagnosticoVeterinarioEntity): DiagnosticoVeterinarioResponseDto {
    return { id: e.id, nombre: e.nombre, descripcion: e.descripcion, categoria: e.categoria, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class MotivoVentaMapper {
  static toResponse(e: MotivoVentaEntity): MotivoVentaResponseDto {
    return { id: e.id, nombre: e.nombre, descripcion: e.descripcion, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class CausaMuerteMapper {
  static toResponse(e: CausaMuerteEntity): CausaMuerteResponseDto {
    return { id: e.id, nombre: e.nombre, descripcion: e.descripcion, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class LugarCompraMapper {
  static toResponse(e: LugarCompraEntity): LugarCompraResponseDto {
    return { id: e.id, nombre: e.nombre, tipo: e.tipo, ubicacion: e.ubicacion, contacto: e.contacto, telefono: e.telefono, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}

export class LugarVentaMapper {
  static toResponse(e: LugarVentaEntity): LugarVentaResponseDto {
    return { id: e.id, nombre: e.nombre, tipo: e.tipo, ubicacion: e.ubicacion, contacto: e.contacto, telefono: e.telefono, activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null, updatedAt: e.updatedAt?.toISOString() ?? null }
  }
}
