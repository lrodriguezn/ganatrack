import { injectable } from 'tsyringe'
import { eq, and, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosPalpacionesGrupal } from '@ganatrack/database/schema'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { PalpacionGrupalEntity } from '../../domain/entities/palpacion.entity.js'

@injectable()
export class DrizzlePalpacionGrupalRepository implements IPalpacionGrupalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const conditions = [eq(serviciosPalpacionesGrupal.predioId, predioId), eq(serviciosPalpacionesGrupal.activo, 1)]
    const rows = await this.db.select().from(serviciosPalpacionesGrupal).where(and(...conditions)).orderBy(desc(serviciosPalpacionesGrupal.fecha)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(serviciosPalpacionesGrupal).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<PalpacionGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosPalpacionesGrupal).where(and(eq(serviciosPalpacionesGrupal.id, id), eq(serviciosPalpacionesGrupal.predioId, predioId), eq(serviciosPalpacionesGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async findByCodigo(codigo: string, predioId: number): Promise<PalpacionGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosPalpacionesGrupal).where(and(eq(serviciosPalpacionesGrupal.codigo, codigo), eq(serviciosPalpacionesGrupal.predioId, predioId), eq(serviciosPalpacionesGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<PalpacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionGrupalEntity> {
    const [row] = await this.db.insert(serviciosPalpacionesGrupal).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<PalpacionGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PalpacionGrupalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(serviciosPalpacionesGrupal).set(updateData).where(eq(serviciosPalpacionesGrupal.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(serviciosPalpacionesGrupal).set({ activo: 0, updatedAt: new Date() }).where(and(eq(serviciosPalpacionesGrupal.id, id), eq(serviciosPalpacionesGrupal.predioId, predioId)))
    return true
  }
}
