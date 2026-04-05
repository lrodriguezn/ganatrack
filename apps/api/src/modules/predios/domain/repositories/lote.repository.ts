import type { LoteEntity } from '../entities/lote.entity.js'

export interface ILoteRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: LoteEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<LoteEntity | null>
  create(data: Omit<LoteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoteEntity>
  update(id: number, data: Partial<Omit<LoteEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LoteEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const LOTE_REPOSITORY = Symbol('ILoteRepository')
