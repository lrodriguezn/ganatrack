import type { PotreroEntity } from '../entities/potrero.entity.js'

export interface IPotreroRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: PotreroEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<PotreroEntity | null>
  findByPredioAndCodigo(predioId: number, codigo: string): Promise<PotreroEntity | null>
  create(data: Omit<PotreroEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PotreroEntity>
  update(id: number, data: Partial<Omit<PotreroEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PotreroEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const POTRERO_REPOSITORY = Symbol('IPotreroRepository')
