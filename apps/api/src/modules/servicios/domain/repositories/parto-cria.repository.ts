import type { PartoCriaEntity } from '../entities/parto.entity.js'

export interface IPartoCriaRepository {
  findByPartoId(partoId: number): Promise<PartoCriaEntity[]>
  findById(id: number): Promise<PartoCriaEntity | null>
  create(data: Omit<PartoCriaEntity, 'id' | 'createdAt'>): Promise<PartoCriaEntity>
  createMany(data: Omit<PartoCriaEntity, 'id' | 'createdAt'>[]): Promise<PartoCriaEntity[]>
}

export const PARTO_CRIA_REPOSITORY = Symbol('IPartoCriaRepository')
