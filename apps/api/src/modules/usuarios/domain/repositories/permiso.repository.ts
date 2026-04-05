import type { PermisoEntity } from '../entities/permiso.entity.js'

export interface IPermisoRepository {
  findAll(): Promise<PermisoEntity[]>
}

export const PERMISO_REPOSITORY = Symbol('IPermisoRepository')
