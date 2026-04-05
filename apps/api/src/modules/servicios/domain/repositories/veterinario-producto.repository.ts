import type { VeterinarioProductoEntity } from '../entities/veterinario.entity.js'

export interface IVeterinarioProductoRepository {
  findByAnimalId(animalId: number): Promise<VeterinarioProductoEntity[]>
  findById(id: number): Promise<VeterinarioProductoEntity | null>
  create(data: Omit<VeterinarioProductoEntity, 'id' | 'createdAt'>): Promise<VeterinarioProductoEntity>
  createMany(data: Omit<VeterinarioProductoEntity, 'id' | 'createdAt'>[]): Promise<VeterinarioProductoEntity[]>
}

export const VETERINARIO_PRODUCTO_REPOSITORY = Symbol('IVeterinarioProductoRepository')
