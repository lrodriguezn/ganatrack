import { injectable } from 'tsyringe'
import { and, count, desc, eq, like, or } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { usuarios } from '@ganatrack/database/schema'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import type { UsuarioEntity } from '../../domain/entities/usuario.entity.js'

// Use type assertion to handle the dual-database union type
type AnyDbClient = DbClient extends infer T ? T : never

@injectable()
export class DrizzleUsuarioRepository implements IUsuarioRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(opts: { page: number; limit: number; search?: string; activo?: number }): Promise<{ data: UsuarioEntity[]; total: number }> {
    const { page, limit, search, activo = 1 } = opts

    const conditions = [eq(usuarios.activo, activo)]

    if (search) {
      const searchCondition = or(
        like(usuarios.nombre, `%${search}%`),
        like(usuarios.email, `%${search}%`),
      )
      if (searchCondition) {
        conditions.push(searchCondition)
      }
    }

    const rows = await this.db
      .select()
      .from(usuarios)
      .where(and(...conditions))
      .orderBy(desc(usuarios.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(usuarios)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number): Promise<UsuarioEntity | null> {
    const [row] = await this.db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, id), eq(usuarios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByEmail(email: string): Promise<UsuarioEntity | null> {
    const [row] = await this.db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.email, email), eq(usuarios.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: { nombre: string; email: string }): Promise<UsuarioEntity> {
    const [row] = await this.db
      .insert(usuarios)
      .values({
        nombre: data.nombre,
        email: data.email,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: { nombre?: string; email?: string; activo?: number }): Promise<void> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.email !== undefined) updateData.email = data.email
    if (data.activo !== undefined) updateData.activo = data.activo

    await this.db
      .update(usuarios)
      .set(updateData)
      .where(eq(usuarios.id, id))
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(usuarios)
      .set({ activo: 0, updatedAt: new Date() })
      .where(eq(usuarios.id, id))
  }
}
