import type { ProductoImagenEntity } from '../entities/producto.entity.js'

export interface IProductoImagenRepository {
  findByProductoId(productoId: number): Promise<ProductoImagenEntity[]>
  findById(id: number): Promise<ProductoImagenEntity | null>
  create(data: Omit<ProductoImagenEntity, 'id' | 'createdAt'>): Promise<ProductoImagenEntity>
}

export const PRODUCTO_IMAGEN_REPOSITORY = Symbol('IProductoImagenRepository')
