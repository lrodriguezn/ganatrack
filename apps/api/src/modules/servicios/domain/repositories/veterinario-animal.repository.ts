import type { VeterinarioAnimalEntity } from '../entities/veterinario.entity.js'

export interface IVeterinarioAnimalRepository {
  findByGrupalId(grupalId: number): Promise<VeterinarioAnimalEntity[]>
  findById(id: number, predioId: number): Promise<VeterinarioAnimalEntity | null>
  create(data: Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioAnimalEntity>
  createMany(data: Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<VeterinarioAnimalEntity[]>
  update(id: number, data: Partial<Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<VeterinarioAnimalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const VETERINARIO_ANIMAL_REPOSITORY = Symbol('IVeterinarioAnimalRepository')
