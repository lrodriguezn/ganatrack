import type { PalpacionAnimalEntity } from '../entities/palpacion.entity.js'

export interface IPalpacionAnimalRepository {
  findByGrupalId(grupalId: number): Promise<PalpacionAnimalEntity[]>
  findById(id: number, predioId: number): Promise<PalpacionAnimalEntity | null>
  create(data: Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionAnimalEntity>
  createMany(data: Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PalpacionAnimalEntity[]>
  update(id: number, data: Partial<Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<PalpacionAnimalEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const PALPACION_ANIMAL_REPOSITORY = Symbol('IPalpacionAnimalRepository')
