import type { VeterinarioEntity } from '../entities/veterinario.entity.js'

export interface IVeterinarioRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: VeterinarioEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<VeterinarioEntity | null>
  create(data: Omit<VeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioEntity>
  update(id: number, data: Partial<Omit<VeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<VeterinarioEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const VETERINARIO_REPOSITORY = Symbol('IVeterinarioRepository')
