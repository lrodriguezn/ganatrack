import type { ImagenEntity } from '../entities/animal.entity.js'

export interface IImagenRepository {
  findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: ImagenEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<ImagenEntity | null>
  create(data: Omit<ImagenEntity, 'id' | 'createdAt'>): Promise<ImagenEntity>
  update(id: number, data: Partial<Omit<ImagenEntity, 'id' | 'createdAt'>>): Promise<ImagenEntity | null>
  softDelete(id: number, _predioId: number): Promise<boolean>
}

export const IMAGEN_REPOSITORY = Symbol('IImagenRepository')
