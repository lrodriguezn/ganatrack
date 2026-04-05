import { injectable } from 'tsyringe'
import { eq, and, like, or, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { sectores } from '@ganatrack/database/schema'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import type { SectorEntity } from '../../domain/entities/sector.entity.js'

@injectable()
export class DrizzleSectorRepository implements ISectorRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{ data: SectorEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(sectores.predioId, predioId), eq(sectores.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(sectores.nombre, `%${search}%`),
          like(sectores.codigo, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(sectores)
      .where(and(...conditions))
      .orderBy(desc(sectores.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(sectores)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<SectorEntity | null> {
    const [row] = await this.db
      .select()
      .from(sectores)
      .where(and(eq(sectores.id, id), eq(sectores.predioId, predioId), eq(sectores.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByPredioAndCodigo(predioId: number, codigo: string): Promise<SectorEntity | null> {
    const [row] = await this.db
      .select()
      .from(sectores)
      .where(and(eq(sectores.predioId, predioId), eq(sectores.codigo, codigo), eq(sectores.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<SectorEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SectorEntity> {
    const [row] = await this.db
      .insert(sectores)
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

  async update(id: number, data: Partial<Omit<SectorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SectorEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.codigo !== undefined) updateData.codigo = data.codigo
    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.areaHectareas !== undefined) updateData.areaHectareas = data.areaHectareas
    if (data.tipoPasto !== undefined) updateData.tipoPasto = data.tipoPasto
    if (data.capacidadMaxima !== undefined) updateData.capacidadMaxima = data.capacidadMaxima
    if (data.estado !== undefined) updateData.estado = data.estado
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(sectores)
      .set(updateData)
      .where(eq(sectores.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db
      .update(sectores)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(eq(sectores.id, id), eq(sectores.predioId, predioId)))

    return true
  }
}
