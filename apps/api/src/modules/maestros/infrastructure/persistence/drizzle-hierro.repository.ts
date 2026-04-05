import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { hierros } from '@ganatrack/database/schema'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import type { HierroEntity } from '../../domain/entities/hierro.entity.js'

@injectable()
export class DrizzleHierroRepository implements IHierroRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(hierros.predioId, predioId), eq(hierros.activo, 1)]
    if (search) conditions.push(like(hierros.nombre, `%${search}%`))
    const rows = await this.db.select().from(hierros).where(and(...conditions)).orderBy(desc(hierros.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(hierros).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<HierroEntity | null> {
    const [row] = await this.db.select().from(hierros).where(and(eq(hierros.id, id), eq(hierros.predioId, predioId), eq(hierros.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<HierroEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<HierroEntity> {
    const [row] = await this.db.insert(hierros).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<HierroEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<HierroEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(hierros).set(updateData).where(eq(hierros.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(hierros).set({ activo: 0, updatedAt: new Date() }).where(and(eq(hierros.id, id), eq(hierros.predioId, predioId)))
    return true
  }
}
