import type { GrupoEntity } from '../entities/grupo.entity.js'

export interface IGrupoRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: GrupoEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<GrupoEntity | null>
  create(data: Omit<GrupoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GrupoEntity>
  update(id: number, data: Partial<Omit<GrupoEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GrupoEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const GRUPO_REPOSITORY = Symbol('IGrupoRepository')
