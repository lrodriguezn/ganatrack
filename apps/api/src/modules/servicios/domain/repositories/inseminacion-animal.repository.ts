import type { InseminacionAnimalEntity } from '../entities/inseminacion.entity.js'

export interface IInseminacionAnimalRepository {
  findByGrupalId(grupalId: number): Promise<InseminacionAnimalEntity[]>
  findById(id: number, predioId: number): Promise<InseminacionAnimalEntity | null>
  create(data: Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InseminacionAnimalEntity>
  createMany(data: Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<InseminacionAnimalEntity[]>
  update(id: number, data: Partial<Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<InseminacionAnimalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const INSEMINACION_ANIMAL_REPOSITORY = Symbol('IInseminacionAnimalRepository')
