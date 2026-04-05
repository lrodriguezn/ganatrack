import type { ProductoEntity } from '../entities/producto.entity.js'

export interface IProductoRepository {
  findAll(predioId: number, opts: { page: number; limit: number; tipoProducto?: string }): Promise<{ data: ProductoEntity[]; total: number }>
  findById(id: number, predioId: number): Promise<ProductoEntity | null>
  findByCodigo(codigo: string, predioId: number): Promise<ProductoEntity | null>
  create(data: Omit<ProductoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductoEntity>
  update(id: number, data: Partial<Omit<ProductoEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductoEntity | null>
  softDelete(id: number, predioId: number): Promise<boolean>
}

export const PRODUCTO_REPOSITORY = Symbol('IProductoRepository')
