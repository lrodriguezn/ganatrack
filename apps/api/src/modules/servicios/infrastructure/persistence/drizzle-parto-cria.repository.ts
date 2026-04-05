import { injectable } from 'tsyringe'
import { and, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosPartosCrias } from '@ganatrack/database/schema'
import type { IPartoCriaRepository } from '../../domain/repositories/parto-cria.repository.js'
import type { PartoCriaEntity } from '../../domain/entities/parto.entity.js'

@injectable()
export class DrizzlePartoCriaRepository implements IPartoCriaRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByPartoId(partoId: number): Promise<PartoCriaEntity[]> {
    return await this.db.select().from(serviciosPartosCrias).where(and(eq(serviciosPartosCrias.partoId, partoId), eq(serviciosPartosCrias.activo, 1)))
  }

  async findById(id: number): Promise<PartoCriaEntity | null> {
    const [row] = await this.db.select().from(serviciosPartosCrias).where(eq(serviciosPartosCrias.id, id)).limit(1)
    return row ?? null
  }

  async create(data: Omit<PartoCriaEntity, 'id' | 'createdAt'>): Promise<PartoCriaEntity> {
    const [row] = await this.db.insert(serviciosPartosCrias).values({ ...data, activo: 1 }).returning()
    return row
  }

  async createMany(data: Omit<PartoCriaEntity, 'id' | 'createdAt'>[]): Promise<PartoCriaEntity[]> {
    if (data.length === 0) return []
    const rows = await this.db.insert(serviciosPartosCrias).values(data.map(d => ({ ...d, activo: 1 }))).returning()
    return rows
  }
}
