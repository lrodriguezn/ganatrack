import { injectable } from 'tsyringe'
import { eq, and, like, or, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configColores } from '@ganatrack/database/schema'
import type { IConfigColorRepository } from '../../domain/repositories/config-color.repository.js'
import type { ConfigColorEntity } from '../../domain/entities/config-color.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigColorRepository implements IConfigColorRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigColorEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configColores.activo, 1)]

    if (search) {
      conditions.push(
        or(
          like(configColores.nombre, `%${search}%`),
          like(configColores.codigo, `%${search}%`),
        )!,
      )
    }

    const rows = await this.db
      .select()
      .from(configColores)
      .where(and(...conditions))
      .orderBy(desc(configColores.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configColores)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigColorEntity | null> {
    const [row] = await this.db
      .select()
      .from(configColores)
      .where(and(eq(configColores.id, id), eq(configColores.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigColorEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigColorEntity> {
    const [row] = await this.db
      .insert(configColores)
      .values({
        nombre: data.nombre,
        codigo: data.codigo,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigColorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigColorEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.codigo !== undefined) updateData.codigo = data.codigo
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configColores)
      .set(updateData)
      .where(eq(configColores.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configColores)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configColores.id, id))

    return true
  }
}
