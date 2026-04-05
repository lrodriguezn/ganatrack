import { injectable } from 'tsyringe'
import { eq, and } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosVeterinariosProductos } from '@ganatrack/database/schema'
import type { IVeterinarioProductoRepository } from '../../domain/repositories/veterinario-producto.repository.js'
import type { VeterinarioProductoEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class DrizzleVeterinarioProductoRepository implements IVeterinarioProductoRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByAnimalId(animalId: number): Promise<VeterinarioProductoEntity[]> {
    return await this.db.select().from(serviciosVeterinariosProductos).where(and(eq(serviciosVeterinariosProductos.servicioAnimalId, animalId), eq(serviciosVeterinariosProductos.activo, 1)))
  }

  async findById(id: number): Promise<VeterinarioProductoEntity | null> {
    const [row] = await this.db.select().from(serviciosVeterinariosProductos).where(eq(serviciosVeterinariosProductos.id, id)).limit(1)
    return row ?? null
  }

  async create(data: Omit<VeterinarioProductoEntity, 'id' | 'createdAt'>): Promise<VeterinarioProductoEntity> {
    const [row] = await this.db.insert(serviciosVeterinariosProductos).values({ ...data, activo: 1 }).returning()
    return row
  }

  async createMany(data: Omit<VeterinarioProductoEntity, 'id' | 'createdAt'>[]): Promise<VeterinarioProductoEntity[]> {
    if (data.length === 0) return []
    const rows = await this.db.insert(serviciosVeterinariosProductos).values(data.map(d => ({ ...d, activo: 1 }))).returning()
    return rows
  }
}
