import type { ConfigRazaEntity } from '../entities/config-raza.entity.js'

export interface IConfigRazaRepository {
  findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigRazaEntity[]; total: number }>
  findById(id: number): Promise<ConfigRazaEntity | null>
  findByNombre(nombre: string): Promise<ConfigRazaEntity | null>
  create(data: Omit<ConfigRazaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigRazaEntity>
  update(id: number, data: Partial<Omit<ConfigRazaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigRazaEntity | null>
  softDelete(id: number): Promise<boolean>
}

export const CONFIG_RAZA_REPOSITORY = Symbol('IConfigRazaRepository')
