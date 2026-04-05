import type { LugarCompraEntity } from '../entities/lugar-compra.entity.js'

export interface ILugarCompraRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: LugarCompraEntity[]; total: number }>
  findById(id: number): Promise<LugarCompraEntity | null>
  create(data: Omit<LugarCompraEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LugarCompraEntity>
  update(id: number, data: Partial<Omit<LugarCompraEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LugarCompraEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const LUGAR_COMPRA_REPOSITORY = Symbol('ILugarCompraRepository')
