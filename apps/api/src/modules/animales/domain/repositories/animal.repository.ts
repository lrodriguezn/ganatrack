import type { AnimalEntity } from '../entities/animal.entity.js'

export interface IAnimalRepository {
  findAll(predioId: number, opts: { page: number; limit: number; search?: string; potreroId?: number; estado?: number }): Promise<{ data: AnimalEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<AnimalEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<AnimalEntity | null>
  create(data: Omit<AnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnimalEntity>
  update(id: number, data: Partial<Omit<AnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AnimalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
  // Genealogy
  getGenealogy(id: number, maxDepth?: number): Promise<{ ancestors: AnimalEntity[]; descendants: AnimalEntity[] }>
}

export const ANIMAL_REPOSITORY = Symbol('IAnimalRepository')
