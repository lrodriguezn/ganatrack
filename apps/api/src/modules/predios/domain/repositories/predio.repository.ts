import type { PredioEntity } from '../entities/predio.entity.js'

export interface IPredioRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: PredioEntity[]; total: number }>
  findById(id: number): Promise<PredioEntity | null>
  findByCodigo(codigo: string): Promise<PredioEntity | null>
  create(data: Omit<PredioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PredioEntity>
  update(id: number, data: Partial<Omit<PredioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PredioEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const PREDIO_REPOSITORY = Symbol('IPredioRepository')
