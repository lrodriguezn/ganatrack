import type { ConfigCondicionCorporalEntity } from '../entities/config-condicion-corporal.entity.js'

export interface IConfigCondicionCorporalRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigCondicionCorporalEntity[]; total: number }>
  findById(id: number): Promise<ConfigCondicionCorporalEntity | null>
  create(data: Omit<ConfigCondicionCorporalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigCondicionCorporalEntity>
  update(id: number, data: Partial<Omit<ConfigCondicionCorporalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigCondicionCorporalEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_CONDICION_CORPORAL_REPOSITORY = Symbol('IConfigCondicionCorporalRepository')
