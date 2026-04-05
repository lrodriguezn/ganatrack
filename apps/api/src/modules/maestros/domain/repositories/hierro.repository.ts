import type { HierroEntity } from '../entities/hierro.entity.js'

export interface IHierroRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: HierroEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<HierroEntity | null>
  create(data: Omit<HierroEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<HierroEntity>
  update(id: number, data: Partial<Omit<HierroEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<HierroEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const HIERRO_REPOSITORY = Symbol('IHierroRepository')
