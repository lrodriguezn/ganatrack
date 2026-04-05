import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { lugaresCompras } from '@ganatrack/database/schema'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import type { LugarCompraEntity } from '../../domain/entities/lugar-compra.entity.js'

@injectable()
export class DrizzleLugarCompraRepository implements ILugarCompraRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(lugaresCompras.activo, 1)]
    if (search) conditions.push(like(lugaresCompras.nombre, `%${search}%`))
    const rows = await this.db.select().from(lugaresCompras).where(and(...conditions)).orderBy(desc(lugaresCompras.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(lugaresCompras).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number): Promise<LugarCompraEntity | null> {
    const [row] = await this.db.select().from(lugaresCompras).where(and(eq(lugaresCompras.id, id), eq(lugaresCompras.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<LugarCompraEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LugarCompraEntity> {
    const [row] = await this.db.insert(lugaresCompras).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<LugarCompraEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LugarCompraEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(lugaresCompras).set(updateData).where(eq(lugaresCompras.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db.update(lugaresCompras).set({ activo: 0, updatedAt: new Date() }).where(eq(lugaresCompras.id, id))
    return true
  }
}
