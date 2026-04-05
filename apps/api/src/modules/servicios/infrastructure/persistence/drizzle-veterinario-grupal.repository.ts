import { injectable } from 'tsyringe'
import { and, count, desc, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosVeterinariosGrupal } from '@ganatrack/database/schema'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { VeterinarioGrupalEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class DrizzleVeterinarioGrupalRepository implements IVeterinarioGrupalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const conditions = [eq(serviciosVeterinariosGrupal.predioId, predioId), eq(serviciosVeterinariosGrupal.activo, 1)]
    const rows = await this.db.select().from(serviciosVeterinariosGrupal).where(and(...conditions)).orderBy(desc(serviciosVeterinariosGrupal.fecha)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(serviciosVeterinariosGrupal).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<VeterinarioGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosVeterinariosGrupal).where(and(eq(serviciosVeterinariosGrupal.id, id), eq(serviciosVeterinariosGrupal.predioId, predioId), eq(serviciosVeterinariosGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async findByCodigo(codigo: string, predioId: number): Promise<VeterinarioGrupalEntity | null> {
    const [row] = await this.db.select().from(serviciosVeterinariosGrupal).where(and(eq(serviciosVeterinariosGrupal.codigo, codigo), eq(serviciosVeterinariosGrupal.predioId, predioId), eq(serviciosVeterinariosGrupal.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<VeterinarioGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioGrupalEntity> {
    const [row] = await this.db.insert(serviciosVeterinariosGrupal).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<VeterinarioGrupalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<VeterinarioGrupalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(serviciosVeterinariosGrupal).set(updateData).where(eq(serviciosVeterinariosGrupal.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(serviciosVeterinariosGrupal).set({ activo: 0, updatedAt: new Date() }).where(and(eq(serviciosVeterinariosGrupal.id, id), eq(serviciosVeterinariosGrupal.predioId, predioId)))
    return true
  }
}
