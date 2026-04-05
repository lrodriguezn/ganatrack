import type { RolEntity } from '../entities/rol.entity.js'
import type { PermisoEntity } from '../entities/permiso.entity.js'

export interface IRolRepository {
  findAll(): Promise<RolEntity[]>
  findById(id: number): Promise<RolEntity | null>
  create(data: { nombre: string; descripcion?: string }): Promise<RolEntity>
  update(id: number, data: { nombre?: string; descripcion?: string }): Promise<void>
  getPermisosByRol(rolId: number): Promise<PermisoEntity[]>
  assignPermisos(rolId: number, permisosIds: number[]): Promise<void>
}

export const ROL_REPOSITORY = Symbol('IRolRepository')
