import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { lotes } from '@ganatrack/database/schema'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import type { LoteEntity } from '../../domain/entities/lote.entity.js'

@injectable()
export class DrizzleLoteRepository implements ILoteRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: LoteEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(lotes.predioId, predioId), eq(lotes.activo, 1)]

    if (search) {
      conditions.push(like(lotes.nombre, `%${search}%`))
    }

    const rows = await this.db
      .select()
      .from(lotes)
      .where(and(...conditions))
      .orderBy(desc(lotes.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(lotes)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<LoteEntity | null> {
    const [row] = await this.db
      .select()
      .from(lotes)
      .where(and(eq(lotes.id, id), eq(lotes.predioId, predioId), eq(lotes.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<LoteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoteEntity> {
    const [row] = await this.db
      .insert(lotes)
      .values({
        predioId: data.predioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<LoteEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LoteEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.tipo !== undefined) updateData.tipo = data.tipo
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(lotes)
      .set(updateData)
      .where(eq(lotes.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db
      .update(lotes)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(eq(lotes.id, id), eq(lotes.predioId, predioId)))

    return true
  }
}
