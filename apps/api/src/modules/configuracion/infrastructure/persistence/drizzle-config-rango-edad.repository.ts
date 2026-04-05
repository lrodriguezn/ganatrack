import { injectable } from 'tsyringe'
import { and, count, desc, eq, like, or } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configRangosEdades } from '@ganatrack/database/schema'
import type { IConfigRangoEdadRepository } from '../../domain/repositories/config-rango-edad.repository.js'
import type { ConfigRangoEdadEntity } from '../../domain/entities/config-rango-edad.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigRangoEdadRepository implements IConfigRangoEdadRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigRangoEdadEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configRangosEdades.activo, 1)]

    if (search) {
      const searchCondition = or(
        like(configRangosEdades.nombre, `%${search}%`),
        like(configRangosEdades.descripcion, `%${search}%`),
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const rows = await this.db
      .select()
      .from(configRangosEdades)
      .where(and(...conditions))
      .orderBy(desc(configRangosEdades.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configRangosEdades)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigRangoEdadEntity | null> {
    const [row] = await this.db
      .select()
      .from(configRangosEdades)
      .where(and(eq(configRangosEdades.id, id), eq(configRangosEdades.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigRangoEdadEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigRangoEdadEntity> {
    const [row] = await this.db
      .insert(configRangosEdades)
      .values({
        nombre: data.nombre,
        rango1: data.rango1,
        rango2: data.rango2,
        sexo: data.sexo,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigRangoEdadEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigRangoEdadEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.rango1 !== undefined) updateData.rango1 = data.rango1
    if (data.rango2 !== undefined) updateData.rango2 = data.rango2
    if (data.sexo !== undefined) updateData.sexo = data.sexo
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configRangosEdades)
      .set(updateData)
      .where(eq(configRangosEdades.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configRangosEdades)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configRangosEdades.id, id))

    return true
  }
}
