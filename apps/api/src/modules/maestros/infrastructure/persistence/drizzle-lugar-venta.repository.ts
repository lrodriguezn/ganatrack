import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { lugaresVentas } from '@ganatrack/database/schema'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import type { LugarVentaEntity } from '../../domain/entities/lugar-venta.entity.js'

@injectable()
export class DrizzleLugarVentaRepository implements ILugarVentaRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(lugaresVentas.activo, 1)]
    if (search) conditions.push(like(lugaresVentas.nombre, `%${search}%`))
    const rows = await this.db.select().from(lugaresVentas).where(and(...conditions)).orderBy(desc(lugaresVentas.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(lugaresVentas).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number): Promise<LugarVentaEntity | null> {
    const [row] = await this.db.select().from(lugaresVentas).where(and(eq(lugaresVentas.id, id), eq(lugaresVentas.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<LugarVentaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LugarVentaEntity> {
    const [row] = await this.db.insert(lugaresVentas).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<LugarVentaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LugarVentaEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(lugaresVentas).set(updateData).where(eq(lugaresVentas.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db.update(lugaresVentas).set({ activo: 0, updatedAt: new Date() }).where(eq(lugaresVentas.id, id))
    return true
  }
}
