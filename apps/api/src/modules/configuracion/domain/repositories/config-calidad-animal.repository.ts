import type { ConfigCalidadAnimalEntity } from '../entities/config-calidad-animal.entity.js'

export interface IConfigCalidadAnimalRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigCalidadAnimalEntity[]; total: number }>
  findById(id: number): Promise<ConfigCalidadAnimalEntity | null>
  create(data: Omit<ConfigCalidadAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigCalidadAnimalEntity>
  update(id: number, data: Partial<Omit<ConfigCalidadAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigCalidadAnimalEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_CALIDAD_ANIMAL_REPOSITORY = Symbol('IConfigCalidadAnimalRepository')
