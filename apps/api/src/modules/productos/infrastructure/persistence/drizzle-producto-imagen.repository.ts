import { injectable } from 'tsyringe'
import { eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { productosImagenes } from '@ganatrack/database/schema'
import type { IProductoImagenRepository } from '../../domain/repositories/producto-imagen.repository.js'
import type { ProductoImagenEntity } from '../../domain/entities/producto.entity.js'

@injectable()
export class DrizzleProductoImagenRepository implements IProductoImagenRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByProductoId(productoId: number): Promise<ProductoImagenEntity[]> {
    return await this.db.select().from(productosImagenes).where(eq(productosImagenes.productoId, productoId))
  }

  async findById(id: number): Promise<ProductoImagenEntity | null> {
    const [row] = await this.db.select().from(productosImagenes).where(eq(productosImagenes.id, id)).limit(1)
    return row ?? null
  }

  async create(data: Omit<ProductoImagenEntity, 'id' | 'createdAt'>): Promise<ProductoImagenEntity> {
    const [row] = await this.db.insert(productosImagenes).values({ ...data, activo: 1 }).returning()
    return row
  }
}
