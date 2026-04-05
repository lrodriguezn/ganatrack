import type { VeterinarioGrupalEntity } from '../entities/veterinario.entity.js'

export interface IVeterinarioGrupalRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: VeterinarioGrupalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<VeterinarioGrupalEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<VeterinarioGrupalEntity | null>
  create(data: Omit<VeterinarioGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioGrupalEntity>
  update(id: number, data: Partial<Omit<VeterinarioGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<VeterinarioGrupalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const VETERINARIO_GRUPAL_REPOSITORY = Symbol('IVeterinarioGrupalRepository')
