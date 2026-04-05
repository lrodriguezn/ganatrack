import { injectable } from 'tsyringe'
import { and, count, desc, eq, like, or } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configCalidadAnimal } from '@ganatrack/database/schema'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { ConfigCalidadAnimalEntity } from '../../domain/entities/config-calidad-animal.entity.js'

type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleConfigCalidadAnimalRepository implements IConfigCalidadAnimalRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string }): Promise<{ data: ConfigCalidadAnimalEntity[]; total: number }> {
    const { page, limit, search } = opts
    const conditions = [eq(configCalidadAnimal.activo, 1)]

    if (search) {
      const searchCondition = or(
        like(configCalidadAnimal.nombre, `%${search}%`),
        like(configCalidadAnimal.descripcion, `%${search}%`),
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const rows = await this.db
      .select()
      .from(configCalidadAnimal)
      .where(and(...conditions))
      .orderBy(desc(configCalidadAnimal.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configCalidadAnimal)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<ConfigCalidadAnimalEntity | null> {
    const [row] = await this.db
      .select()
      .from(configCalidadAnimal)
      .where(and(eq(configCalidadAnimal.id, id), eq(configCalidadAnimal.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigCalidadAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigCalidadAnimalEntity> {
    const [row] = await this.db
      .insert(configCalidadAnimal)
      .values({
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigCalidadAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigCalidadAnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configCalidadAnimal)
      .set(updateData)
      .where(eq(configCalidadAnimal.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db
      .update(configCalidadAnimal)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(configCalidadAnimal.id, id))

    return true
  }
}
