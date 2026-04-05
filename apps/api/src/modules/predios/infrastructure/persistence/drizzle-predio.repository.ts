import { injectable } from 'tsyringe'
import { eq, and, like, or, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { predios } from '@ganatrack/database/schema'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import type { PredioEntity } from '../../domain/entities/predio.entity.js'

@injectable()
export class DrizzlePredioRepository implements IPredioRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: PredioEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(predios.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(predios.nombre, `%${search}%`),
          like(predios.codigo, `%${search}%`),
          like(predios.departamento, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(predios)
      .where(and(...conditions))
      .orderBy(desc(predios.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(predios)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<PredioEntity | null> {
    const [row] = await this.db
      .select()
      .from(predios)
      .where(and(eq(predios.id, id), eq(predios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByCodigo(codigo: string): Promise<PredioEntity | null> {
    const [row] = await this.db
      .select()
      .from(predios)
      .where(and(eq(predios.codigo, codigo), eq(predios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<PredioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PredioEntity> {
    const [row] = await this.db
      .insert(predios)
      .values({
        codigo: data.codigo,
        nombre: data.nombre,
        departamento: data.departamento,
        municipio: data.municipio,
        vereda: data.vereda,
        areaHectareas: data.areaHectareas,
        capacidadMaxima: data.capacidadMaxima,
        tipoExplotacionId: data.tipoExplotacionId,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<PredioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PredioEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.codigo !== undefined) updateData.codigo = data.codigo
    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.departamento !== undefined) updateData.departamento = data.departamento
    if (data.municipio !== undefined) updateData.municipio = data.municipio
    if (data.vereda !== undefined) updateData.vereda = data.vereda
    if (data.areaHectareas !== undefined) updateData.areaHectareas = data.areaHectareas
    if (data.capacidadMaxima !== undefined) updateData.capacidadMaxima = data.capacidadMaxima
    if (data.tipoExplotacionId !== undefined) updateData.tipoExplotacionId = data.tipoExplotacionId
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(predios)
      .set(updateData)
      .where(eq(predios.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(predios)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(predios.id, id))

    return true
  }
}
