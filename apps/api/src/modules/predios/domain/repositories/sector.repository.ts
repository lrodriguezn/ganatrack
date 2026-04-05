import type { SectorEntity } from '../entities/sector.entity.js'

export interface ISectorRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: SectorEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<SectorEntity | null>
  findByPredioAndCodigo(predioId: number, codigo: string): Promise<SectorEntity | null>
  create(data: Omit<SectorEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SectorEntity>
  update(id: number, data: Partial<Omit<SectorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SectorEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const SECTOR_REPOSITORY = Symbol('ISectorRepository')
