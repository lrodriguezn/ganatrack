import { injectable } from 'tsyringe'
import { eq, and, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosPartosAnimales } from '@ganatrack/database/schema'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import type { PartoAnimalEntity } from '../../domain/entities/parto.entity.js'

@injectable()
export class DrizzlePartoAnimalRepository implements IPartoAnimalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const conditions = [eq(serviciosPartosAnimales.predioId, predioId), eq(serviciosPartosAnimales.activo, 1)]
    const rows = await this.db.select().from(serviciosPartosAnimales).where(and(...conditions)).orderBy(desc(serviciosPartosAnimales.fecha)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(serviciosPartosAnimales).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<PartoAnimalEntity | null> {
    const [row] = await this.db.select().from(serviciosPartosAnimales).where(and(eq(serviciosPartosAnimales.id, id), eq(serviciosPartosAnimales.predioId, predioId), eq(serviciosPartosAnimales.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<PartoAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PartoAnimalEntity> {
    const [row] = await this.db.insert(serviciosPartosAnimales).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<PartoAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<PartoAnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(serviciosPartosAnimales).set(updateData).where(and(eq(serviciosPartosAnimales.id, id), eq(serviciosPartosAnimales.predioId, predioId))).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(serviciosPartosAnimales).set({ activo: 0, updatedAt: new Date() }).where(and(eq(serviciosPartosAnimales.id, id), eq(serviciosPartosAnimales.predioId, predioId)))
    return true
  }
}
