import type { ConfigParametroPredioEntity } from '../entities/config-parametro-predio.entity.js'

export interface IConfigParametroPredioRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: ConfigParametroPredioEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<ConfigParametroPredioEntity | null>
  findByPredioAndCodigo(predioId: number, codigo: string): Promise<ConfigParametroPredioEntity | null>
  create(data: Omit<ConfigParametroPredioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigParametroPredioEntity>
  update(id: number, data: Partial<Omit<ConfigParametroPredioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigParametroPredioEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const CONFIG_PARAMETRO_PREDIO_REPOSITORY = Symbol('IConfigParametroPredioRepository')
