import { injectable } from 'tsyringe'
import { and, count, desc, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { configParametrosPredio } from '@ganatrack/database/schema'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { ConfigParametroPredioEntity } from '../../domain/entities/config-parametro-predio.entity.js'

@injectable()
export class DrizzleConfigParametroPredioRepository implements IConfigParametroPredioRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async findAll(predioId: number, opts: { page: number; limit: number }): Promise<{ data: ConfigParametroPredioEntity[]; total: number }> {
    const { page, limit } = opts
    const conditions = [eq(configParametrosPredio.predioId, predioId), eq(configParametrosPredio.activo, 1)]

    const rows = await this.db
      .select()
      .from(configParametrosPredio)
      .where(and(...conditions))
      .orderBy(desc(configParametrosPredio.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(configParametrosPredio)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<ConfigParametroPredioEntity | null> {
    const [row] = await this.db
      .select()
      .from(configParametrosPredio)
      .where(and(eq(configParametrosPredio.id, id), eq(configParametrosPredio.predioId, predioId), eq(configParametrosPredio.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async findByPredioAndCodigo(predioId: number, codigo: string): Promise<ConfigParametroPredioEntity | null> {
    const [row] = await this.db
      .select()
      .from(configParametrosPredio)
      .where(and(eq(configParametrosPredio.predioId, predioId), eq(configParametrosPredio.codigo, codigo), eq(configParametrosPredio.activo, 1)))
      .limit(1)

    return row ?? null
  }

  async create(data: Omit<ConfigParametroPredioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConfigParametroPredioEntity> {
    const [row] = await this.db
      .insert(configParametrosPredio)
      .values({
        predioId: data.predioId,
        codigo: data.codigo,
        valor: data.valor,
        descripcion: data.descripcion,
        activo: 1,
      })
      .returning()

    return row
  }

  async update(id: number, data: Partial<Omit<ConfigParametroPredioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ConfigParametroPredioEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.codigo !== undefined) updateData.codigo = data.codigo
    if (data.valor !== undefined) updateData.valor = data.valor
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.activo !== undefined) updateData.activo = data.activo

    const [row] = await this.db
      .update(configParametrosPredio)
      .set(updateData)
      .where(eq(configParametrosPredio.id, id))
      .returning()

    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db
      .update(configParametrosPredio)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(eq(configParametrosPredio.id, id), eq(configParametrosPredio.predioId, predioId)))

    return true
  }
}
