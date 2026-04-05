import type { InseminacionGrupalEntity } from '../entities/inseminacion.entity.js'

export interface IInseminacionGrupalRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: InseminacionGrupalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<InseminacionGrupalEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<InseminacionGrupalEntity | null>
  create(data: Omit<InseminacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InseminacionGrupalEntity>
  update(id: number, data: Partial<Omit<InseminacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InseminacionGrupalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const INSEMINACION_GRUPAL_REPOSITORY = Symbol('IInseminacionGrupalRepository')
