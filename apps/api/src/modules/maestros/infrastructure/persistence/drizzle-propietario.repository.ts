import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { propietarios } from '@ganatrack/database/schema'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import type { PropietarioEntity } from '../../domain/entities/propietario.entity.js'

@injectable()
export class DrizzlePropietarioRepository implements IPropietarioRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(propietarios.predioId, predioId), eq(propietarios.activo, 1)]
    if (search) conditions.push(like(propietarios.nombre, `%${search}%`))
    const rows = await this.db.select().from(propietarios).where(and(...conditions)).orderBy(desc(propietarios.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(propietarios).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<PropietarioEntity | null> {
    const [row] = await this.db.select().from(propietarios).where(and(eq(propietarios.id, id), eq(propietarios.predioId, predioId), eq(propietarios.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<PropietarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropietarioEntity> {
    const [row] = await this.db.insert(propietarios).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<PropietarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PropietarioEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(propietarios).set(updateData).where(eq(propietarios.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(propietarios).set({ activo: 0, updatedAt: new Date() }).where(and(eq(propietarios.id, id), eq(propietarios.predioId, predioId)))
    return true
  }
}
