import type { ConfigRangoEdadEntity } from '../entities/config-rango-edad.entity.js'

export interface IConfigRangoEdadRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigRangoEdadEntity[]; total: number }>
  findById(id: number): Promise<ConfigRangoEdadEntity | null>
  create(data: Omit<ConfigRangoEdadEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigRangoEdadEntity>
  update(id: number, data: Partial<Omit<ConfigRangoEdadEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigRangoEdadEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_RANGO_EDAD_REPOSITORY = Symbol('IConfigRangoEdadRepository')
