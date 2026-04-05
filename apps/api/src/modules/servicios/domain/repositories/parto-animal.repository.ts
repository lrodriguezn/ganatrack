import type { PartoAnimalEntity } from '../entities/parto.entity.js'

export interface IPartoAnimalRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: PartoAnimalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<PartoAnimalEntity | null>
  create(data: Omit<PartoAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PartoAnimalEntity>
  update(id: number, data: Partial<Omit<PartoAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<PartoAnimalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const PARTO_ANIMAL_REPOSITORY = Symbol('IPartoAnimalRepository')
