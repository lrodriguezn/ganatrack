import type { MotivoVentaEntity } from '../entities/motivo-venta.entity.js'

export interface IMotivoVentaRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: MotivoVentaEntity[]; total: number }>
  findById(id: number): Promise<MotivoVentaEntity | null>
  create(data: Omit<MotivoVentaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<MotivoVentaEntity>
  update(id: number, data: Partial<Omit<MotivoVentaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MotivoVentaEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const MOTIVO_VENTA_REPOSITORY = Symbol('IMotivoVentaRepository')
