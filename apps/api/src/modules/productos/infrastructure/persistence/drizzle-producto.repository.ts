import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { productos } from '@ganatrack/database/schema'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import type { ProductoEntity } from '../../domain/entities/producto.entity.js'

@injectable()
export class DrizzleProductoRepository implements IProductoRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number; tipoProducto?: string }) {
    const { page, limit, tipoProducto } = opts
    const conditions = [eq(productos.predioId, predioId), eq(productos.activo, 1)]
    if (tipoProducto) conditions.push(like(productos.tipoProducto, `%${tipoProducto}%`))
    const rows = await this.db.select().from(productos).where(and(...conditions)).orderBy(desc(productos.nombre)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(productos).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<ProductoEntity | null> {
    const [row] = await this.db.select().from(productos).where(and(eq(productos.id, id), eq(productos.predioId, predioId), eq(productos.activo, 1))).limit(1)
    return row ?? null
  }

  async findByCodigo(codigo: string, predioId: number): Promise<ProductoEntity | null> {
    const [row] = await this.db.select().from(productos).where(and(eq(productos.codigo, codigo), eq(productos.predioId, predioId), eq(productos.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<ProductoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductoEntity> {
    const [row] = await this.db.insert(productos).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<ProductoEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProductoEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(productos).set(updateData).where(eq(productos.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(productos).set({ activo: 0, updatedAt: new Date() }).where(and(eq(productos.id, id), eq(productos.predioId, predioId)))
    return true
  }
}
