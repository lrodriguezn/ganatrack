import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { causasMuerte } from '@ganatrack/database/schema'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import type { CausaMuerteEntity } from '../../domain/entities/causa-muerte.entity.js'

@injectable()
export class DrizzleCausaMuerteRepository implements ICausaMuerteRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(causasMuerte.activo, 1)]
    if (search) conditions.push(like(causasMuerte.nombre, `%${search}%`))
    const rows = await this.db.select().from(causasMuerte).where(and(...conditions)).orderBy(desc(causasMuerte.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(causasMuerte).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number): Promise<CausaMuerteEntity | null> {
    const [row] = await this.db.select().from(causasMuerte).where(and(eq(causasMuerte.id, id), eq(causasMuerte.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<CausaMuerteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CausaMuerteEntity> {
    const [row] = await this.db.insert(causasMuerte).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<CausaMuerteEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CausaMuerteEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(causasMuerte).set(updateData).where(eq(causasMuerte.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db.update(causasMuerte).set({ activo: 0, updatedAt: new Date() }).where(eq(causasMuerte.id, id))
    return true
  }
}
