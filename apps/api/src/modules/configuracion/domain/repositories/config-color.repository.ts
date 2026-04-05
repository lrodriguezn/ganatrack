import type { ConfigColorEntity } from '../entities/config-color.entity.js'

export interface IConfigColorRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigColorEntity[]; total: number }>
  findById(id: number): Promise<ConfigColorEntity | null>
  create(data: Omit<ConfigColorEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigColorEntity>
  update(id: number, data: Partial<Omit<ConfigColorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigColorEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_COLOR_REPOSITORY = Symbol('IConfigColorRepository')
