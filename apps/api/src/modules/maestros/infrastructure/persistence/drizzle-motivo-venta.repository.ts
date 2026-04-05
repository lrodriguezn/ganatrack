import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { motivosVentas } from '@ganatrack/database/schema'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import type { MotivoVentaEntity } from '../../domain/entities/motivo-venta.entity.js'

@injectable()
export class DrizzleMotivoVentaRepository implements IMotivoVentaRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(motivosVentas.activo, 1)]
    if (search) conditions.push(like(motivosVentas.nombre, `%${search}%`))
    const rows = await this.db.select().from(motivosVentas).where(and(...conditions)).orderBy(desc(motivosVentas.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(motivosVentas).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number): Promise<MotivoVentaEntity | null> {
    const [row] = await this.db.select().from(motivosVentas).where(and(eq(motivosVentas.id, id), eq(motivosVentas.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<MotivoVentaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<MotivoVentaEntity> {
    const [row] = await this.db.insert(motivosVentas).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<MotivoVentaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MotivoVentaEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(motivosVentas).set(updateData).where(eq(motivosVentas.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db.update(motivosVentas).set({ activo: 0, updatedAt: new Date() }).where(eq(motivosVentas.id, id))
    return true
  }
}
