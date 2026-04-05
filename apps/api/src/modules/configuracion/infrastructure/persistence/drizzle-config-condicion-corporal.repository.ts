import { injectable } from 'tsyringe'
import { eq, and, like, or, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configCondicionesCorporales } from '@ganatrack/database/schema'
import type { IConfigCondicionCorporalRepository } from '../../domain/repositories/config-condicion-corporal.repository.js'
import type { ConfigCondicionCorporalEntity } from '../../domain/entities/config-condicion-corporal.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigCondicionCorporalRepository implements IConfigCondicionCorporalRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigCondicionCorporalEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configCondicionesCorporales.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(configCondicionesCorporales.nombre, `%${search}%`),
          like(configCondicionesCorporales.descripcion, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(configCondicionesCorporales)
      .where(and(...conditions))
      .orderBy(desc(configCondicionesCorporales.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configCondicionesCorporales)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigCondicionCorporalEntity | null> {
    const [row] = await this.db
      .select()
      .from(configCondicionesCorporales)
      .where(and(eq(configCondicionesCorporales.id, id), eq(configCondicionesCorporales.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigCondicionCorporalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigCondicionCorporalEntity> {
    const [row] = await this.db
      .insert(configCondicionesCorporales)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion,
        valorMin: data.valorMin,
        valorMax: data.valorMax,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigCondicionCorporalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigCondicionCorporalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.valorMin !== undefined) updateData.valorMin = data.valorMin
    if (data.valorMax !== undefined) updateData.valorMax = data.valorMax
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configCondicionesCorporales)
      .set(updateData)
      .where(eq(configCondicionesCorporales.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configCondicionesCorporales)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configCondicionesCorporales.id, id))

    return true
  }
}
