import { injectable } from 'tsyringe'
import { and, count, desc, eq, like, or } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configTiposExplotacion } from '@ganatrack/database/schema'
import type { IConfigTipoExplotacionRepository } from '../../domain/repositories/config-tipo-explotacion.repository.js'
import type { ConfigTipoExplotacionEntity } from '../../domain/entities/config-tipo-explotacion.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigTipoExplotacionRepository implements IConfigTipoExplotacionRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigTipoExplotacionEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configTiposExplotacion.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(configTiposExplotacion.nombre, `%${search}%`),
          like(configTiposExplotacion.descripcion, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(configTiposExplotacion)
      .where(and(...conditions))
      .orderBy(desc(configTiposExplotacion.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configTiposExplotacion)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigTipoExplotacionEntity | null> {
    const [row] = await this.db
      .select()
      .from(configTiposExplotacion)
      .where(and(eq(configTiposExplotacion.id, id), eq(configTiposExplotacion.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigTipoExplotacionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigTipoExplotacionEntity> {
    const [row] = await this.db
      .insert(configTiposExplotacion)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigTipoExplotacionEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigTipoExplotacionEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configTiposExplotacion)
      .set(updateData)
      .where(eq(configTiposExplotacion.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configTiposExplotacion)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configTiposExplotacion.id, id))

    return true
  }
}
