import { injectable } from 'tsyringe'
import { and, count, desc, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosInseminacionGrupal } from '@ganatrack/database/schema'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { InseminacionGrupalEntity } from '../../domain/entities/inseminacion.entity.js'

@injectable()
export class DrizzleInseminacionGrupalRepository implements IInseminacionGrupalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const conditions = [eq(serviciosInseminacionGrupal.predioId, predioId), eq(serviciosInseminacionGrupal.activo, 1)]
    const rows = await this.db.select().from(serviciosInseminacionGrupal).where(and(...conditions)).orderBy(desc(serviciosInseminacionGrupal.fecha)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(serviciosInseminacionGrupal).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<InseminacionGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosInseminacionGrupal).where(and(eq(serviciosInseminacionGrupal.id, id), eq(serviciosInseminacionGrupal.predioId, predioId), eq(serviciosInseminacionGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async findByCodigo(codigo: string, predioId: number): Promise<InseminacionGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosInseminacionGrupal).where(and(eq(serviciosInseminacionGrupal.codigo, codigo), eq(serviciosInseminacionGrupal.predioId, predioId), eq(serviciosInseminacionGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<InseminacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InseminacionGrupalEntity> {
    const [row] = await this.db.insert(serviciosInseminacionGrupal).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<InseminacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InseminacionGrupalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(serviciosInseminacionGrupal).set(updateData).where(eq(serviciosInseminacionGrupal.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(serviciosInseminacionGrupal).set({ activo: 0, updatedAt: new Date() }).where(and(eq(serviciosInseminacionGrupal.id, id), eq(serviciosInseminacionGrupal.predioId, predioId)))
    return true
  }
}
