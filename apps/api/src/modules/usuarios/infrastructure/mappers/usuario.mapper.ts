import type { UsuarioEntity } from '../../domain/entities/usuario.entity.js'
import type { RolEntity } from '../../domain/entities/rol.entity.js'
import type { PermisoEntity } from '../../domain/entities/permiso.entity.js'
import type { UsuarioResponseDto, RolResponseDto, PermisoResponseDto } from '../../application/dtos/usuario.dto.js'

export class UsuarioMapper {
  static toResponse(usuario: UsuarioEntity, roles: string[]): UsuarioResponseDto {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      activo: usuario.activo,
      roles,
      createdAt: usuario.createdAt?.toISOString() ?? null,
    }
  }
}

export class RolMapper {
  static toResponse(rol: RolEntity, permisos: PermisoEntity[]): RolResponseDto {
    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      esSistema: rol.esSistema,
      permisos: permisos.map((p) => ({
        id: p.id,
        modulo: p.modulo,
        accion: p.accion,
        nombre: p.nombre,
      })),
    }
  }
}

export class PermisoMapper {
  static toResponse(permiso: PermisoEntity): PermisoResponseDto {
    return {
      id: permiso.id,
      modulo: permiso.modulo,
      accion: permiso.accion,
      nombre: permiso.nombre,
    }
  }
}
