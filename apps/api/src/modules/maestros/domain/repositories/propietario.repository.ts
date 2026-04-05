import type { PropietarioEntity } from '../entities/propietario.entity.js'

export interface IPropietarioRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: PropietarioEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<PropietarioEntity | null>
  create(data: Omit<PropietarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropietarioEntity>
  update(id: number, data: Partial<Omit<PropietarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PropietarioEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const PROPIETARIO_REPOSITORY = Symbol('IPropietarioRepository')
