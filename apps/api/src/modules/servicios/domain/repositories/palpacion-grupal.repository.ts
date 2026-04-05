import type { PalpacionGrupalEntity } from '../entities/palpacion.entity.js'

export interface IPalpacionGrupalRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: PalpacionGrupalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<PalpacionGrupalEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<PalpacionGrupalEntity | null>
  create(data: Omit<PalpacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionGrupalEntity>
  update(id: number, data: Partial<Omit<PalpacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PalpacionGrupalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const PALPACION_GRUPAL_REPOSITORY = Symbol('IPalpacionGrupalRepository')
