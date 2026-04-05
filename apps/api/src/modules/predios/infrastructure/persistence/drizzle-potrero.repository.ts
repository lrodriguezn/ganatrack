import { injectable } from 'tsyringe'
import { eq, and, like, or, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { potreros } from '@ganatrack/database/schema'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import type { PotreroEntity } from '../../domain/entities/potrero.entity.js'

@injectable()
export class DrizzlePotreroRepository implements IPotreroRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: PotreroEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(potreros.predioId, predioId), eq(potreros.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(potreros.nombre, `%${search}%`),
          like(potreros.codigo, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(potreros)
      .where(and(...conditions))
      .orderBy(desc(potreros.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(potreros)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<PotreroEntity | null> {
    const [row] = await this.db
      .select()
      .from(potreros)
      .where(and(eq(potreros.id, id), eq(potreros.predioId, predioId), eq(potreros.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByPredioAndCodigo(predioId: number, codigo: string): Promise<PotreroEntity | null> {
    const [row] = await this.db
      .select()
      .from(potreros)
      .where(and(eq(potreros.predioId, predioId), eq(potreros.codigo, codigo), eq(potreros.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<PotreroEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PotreroEntity> {
    const [row] = await this.db
      .insert(potreros)
      .values({
        predioId: data.predioId,
        codigo: data.codigo,
        nombre: data.nombre,
        areaHectareas: data.areaHectareas,
        tipoPasto: data.tipoPasto,
        capacidadMaxima: data.capacidadMaxima,
        estado: data.estado,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<PotreroEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PotreroEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.codigo !== undefined) updateData.codigo = data.codigo
    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.areaHectareas !== undefined) updateData.areaHectareas = data.areaHectareas
    if (data.tipoPasto !== undefined) updateData.tipoPasto = data.tipoPasto
    if (data.capacidadMaxima !== undefined) updateData.capacidadMaxima = data.capacidadMaxima
    if (data.estado !== undefined) updateData.estado = data.estado
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(potreros)
      .set(updateData)
      .where(eq(potreros.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db
      .update(potreros)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(eq(potreros.id, id), eq(potreros.predioId, predioId)))

    return true
  }
}
