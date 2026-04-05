import type { ConfigKeyValueEntity } from '../entities/config-key-value.entity.js'

export interface IConfigKeyValueRepository {
  findAll(opts: { page: number; limit: number; opcion?: string }): Promise<{ data: ConfigKeyValueEntity[]; total: number }>
  findById(id: number): Promise<ConfigKeyValueEntity | null>
  findByOpcionAndKey(opcion: string, key: string): Promise<ConfigKeyValueEntity | null>
  create(data: Omit<ConfigKeyValueEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigKeyValueEntity>
  update(id: number, data: Partial<Omit<ConfigKeyValueEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigKeyValueEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_KEY_VALUE_REPOSITORY = Symbol('IConfigKeyValueRepository')
