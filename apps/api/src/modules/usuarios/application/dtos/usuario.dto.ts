export interface CreateUsuarioDto {
  nombre: string
  email: string
  password: string
  rolesIds?: number[]
}

export interface UpdateUsuarioDto {
  nombre?: string
  email?: string
  activo?: number
}

export interface UsuarioResponseDto {
  id: number
  nombre: string
  email: string
  activo: number
  roles: string[]
  createdAt: string | null
}

export interface CreateRolDto {
  nombre: string
  descripcion?: string
  permisosIds?: number[]
}

export interface UpdateRolDto {
  nombre?: string
  descripcion?: string
  permisosIds?: number[]
}

export interface RolResponseDto {
  id: number
  nombre: string
  descripcion: string | null
  esSistema: number
  permisos: { id: number; modulo: string; accion: string; nombre: string }[]
}

export interface PermisoResponseDto {
  id: number
  modulo: string
  accion: string
  nombre: string
}

export interface GetMeResponseDto {
  id: number
  nombre: string
  email: string
  roles: string[]
  permisos: string[]
}
