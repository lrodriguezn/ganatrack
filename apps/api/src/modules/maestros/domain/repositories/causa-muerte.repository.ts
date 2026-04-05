import type { CausaMuerteEntity } from '../entities/causa-muerte.entity.js'

export interface ICausaMuerteRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: CausaMuerteEntity[]; total: number }>
  findById(id: number): Promise<CausaMuerteEntity | null>
  create(data: Omit<CausaMuerteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CausaMuerteEntity>
  update(id: number, data: Partial<Omit<CausaMuerteEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CausaMuerteEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CAUSA_MUERTE_REPOSITORY = Symbol('ICausaMuerteRepository')
