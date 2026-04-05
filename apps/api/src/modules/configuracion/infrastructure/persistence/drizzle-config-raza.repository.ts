import { injectable } from 'tsyringe'
import { and, count, desc, eq, like, or } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configRazas } from '@ganatrack/database/schema'
import type { IConfigRazaRepository } from '../../domain/repositories/config-raza.repository.js'
import type { ConfigRazaEntity } from '../../domain/entities/config-raza.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigRazaRepository implements IConfigRazaRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigRazaEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configRazas.activo, 1)]

    if (search) {
      const searchCondition = or(
        like(configRazas.nombre, `%${search}%`),
        like(configRazas.descripcion, `%${search}%`),
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const rows = await this.db
      .select()
      .from(configRazas)
      .where(and(...conditions))
      .orderBy(desc(configRazas.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configRazas)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigRazaEntity | null> {
    const [row] = await this.db
      .select()
      .from(configRazas)
      .where(and(eq(configRazas.id, id), eq(configRazas.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByNombre(nombre: string): Promise<ConfigRazaEntity | null> {
    const [row] = await this.db
      .select()
      .from(configRazas)
      .where(and(eq(configRazas.nombre, nombre), eq(configRazas.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigRazaEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigRazaEntity> {
    const [row] = await this.db
      .insert(configRazas)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion,
        origen: data.origen,
        tipoProduccion: data.tipoProduccion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigRazaEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigRazaEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.origen !== undefined) updateData.origen = data.origen
    if (data.tipoProduccion !== undefined) updateData.tipoProduccion = data.tipoProduccion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configRazas)
      .set(updateData)
      .where(eq(configRazas.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.db
      .update(configRazas)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configRazas.id, id))

    return true
  }
}
