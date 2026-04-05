import { injectable } from 'tsyringe'
import { and, count, desc, eq, like } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configKeyValues } from '@ganatrack/database/schema'
import type { IConfigKeyValueRepository } from '../../domain/repositories/config-key-value.repository.js'
import type { ConfigKeyValueEntity } from '../../domain/entities/config-key-value.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigKeyValueRepository implements IConfigKeyValueRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; opcion?: string }): Promise<{ data: ConfigKeyValueEntity[]; total: number }> {
    const { page, limit, opcion } = opts
    const conditions = [eq(configKeyValues.activo, 1)]

    if (opcion) {
      conditions.push(eq(configKeyValues.opcion, opcion))
    }

    const rows = await this.db
      .select()
      .from(configKeyValues)
      .where(and(...conditions))
      .orderBy(desc(configKeyValues.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configKeyValues)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigKeyValueEntity | null> {
    const [row] = await this.db
      .select()
      .from(configKeyValues)
      .where(and(eq(configKeyValues.id, id), eq(configKeyValues.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByOpcionAndKey(opcion: string, key: string): Promise<ConfigKeyValueEntity | null> {
    const [row] = await this.db
      .select()
      .from(configKeyValues)
      .where(and(
        eq(configKeyValues.opcion, opcion),
        eq(configKeyValues.key, key),
        eq(configKeyValues.activo, 1),
      ))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigKeyValueEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigKeyValueEntity> {
    const [row] = await this.db
      .insert(configKeyValues)
      .values({
        opcion: data.opcion,
        key: data.key,
        value: data.value,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigKeyValueEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigKeyValueEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.opcion !== undefined) updateData.opcion = data.opcion
    if (data.key !== undefined) updateData.key = data.key
    if (data.value !== undefined) updateData.value = data.value
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configKeyValues)
      .set(updateData)
      .where(eq(configKeyValues.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configKeyValues)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configKeyValues.id, id))

    return true
  }
}
