import type { LugarVentaEntity } from '../entities/lugar-venta.entity.js'

export interface ILugarVentaRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: LugarVentaEntity[]; total: number }>
  findById(id: number): Promise<LugarVentaEntity | null>
  create(data: Omit<LugarVentaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LugarVentaEntity>
  update(id: number, data: Partial<Omit<LugarVentaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LugarVentaEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const LUGAR_VENTA_REPOSITORY = Symbol('ILugarVentaRepository')
