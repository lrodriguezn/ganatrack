import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { veterinarios } from '@ganatrack/database/schema'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { VeterinarioEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class DrizzleVeterinarioRepository implements IVeterinarioRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(veterinarios.predioId, predioId), eq(veterinarios.activo, 1)]
    if (search) conditions.push(like(veterinarios.nombre, `%${search}%`))
    const rows = await this.db.select().from(veterinarios).where(and(...conditions)).orderBy(desc(veterinarios.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(veterinarios).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<VeterinarioEntity | null> {
    const [row] = await this.db.select().from(veterinarios).where(and(eq(veterinarios.id, id), eq(veterinarios.predioId, predioId), eq(veterinarios.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<VeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioEntity> {
    const [row] = await this.db.insert(veterinarios).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<VeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<VeterinarioEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(veterinarios).set(updateData).where(eq(veterinarios.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(veterinarios).set({ activo: 0, updatedAt: new Date() }).where(and(eq(veterinarios.id, id), eq(veterinarios.predioId, predioId)))
    return true
  }
}
