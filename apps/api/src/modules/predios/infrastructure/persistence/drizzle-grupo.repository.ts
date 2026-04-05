import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { grupos } from '@ganatrack/database/schema'
import type { IGrupoRepository } from '../../domain/repositories/grupo.repository.js'
import type { GrupoEntity } from '../../domain/entities/grupo.entity.js'

@injectable()
export class DrizzleGrupoRepository implements IGrupoRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: GrupoEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(grupos.predioId, predioId), eq(grupos.activo, 1)]

    if (search) {
      conditions.push(like(grupos.nombre, `%${search}%`))
    }

    const rows = await this.db
      .select()
      .from(grupos)
      .where(and(...conditions))
      .orderBy(desc(grupos.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(grupos)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<GrupoEntity | null> {
    const [row] = await this.db
      .select()
      .from(grupos)
      .where(and(eq(grupos.id, id), eq(grupos.predioId, predioId), eq(grupos.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<GrupoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GrupoEntity> {
    const [row] = await this.db
      .insert(grupos)
      .values({
        predioId: data.predioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<GrupoEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GrupoEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(grupos)
      .set(updateData)
      .where(eq(grupos.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db
      .update(grupos)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(eq(grupos.id, id), eq(grupos.predioId, predioId)))

    return true
  }
}
