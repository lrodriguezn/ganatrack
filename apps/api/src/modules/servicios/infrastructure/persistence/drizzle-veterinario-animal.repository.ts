import { injectable } from 'tsyringe'
import { eq, and, inArray } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosVeterinariosAnimales, serviciosVeterinariosGrupal } from '@ganatrack/database/schema'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import type { VeterinarioAnimalEntity } from '../../domain/entities/veterinario.entity.js'

@injectable()
export class DrizzleVeterinarioAnimalRepository implements IVeterinarioAnimalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByGrupalId(grupalId: number): Promise<VeterinarioAnimalEntity[]> {
    return await this.db.select().from(serviciosVeterinariosAnimales).where(and(eq(serviciosVeterinariosAnimales.servicioGrupalId, grupalId), eq(serviciosVeterinariosAnimales.activo, 1)))
  }

  async findById(id: number, predioId: number): Promise<VeterinarioAnimalEntity | null> {
    // Verify tenant via parent group
    const [row] = await this.db
      .select({ animal: serviciosVeterinariosAnimales })
      .from(serviciosVeterinariosAnimales)
      .innerJoin(serviciosVeterinariosGrupal, eq(serviciosVeterinariosAnimales.servicioGrupalId, serviciosVeterinariosGrupal.id))
      .where(and(
        eq(serviciosVeterinariosAnimales.id, id),
        eq(serviciosVeterinariosAnimales.activo, 1),
        eq(serviciosVeterinariosGrupal.predioId, predioId)
      ))
      .limit(1)
    return row?.animal ?? null
  }

  async create(data: Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VeterinarioAnimalEntity> {
    const [row] = await this.db.insert(serviciosVeterinariosAnimales).values({ ...data, activo: 1 }).returning()
    return row
  }

  async createMany(data: Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<VeterinarioAnimalEntity[]> {
    if (data.length === 0) return []
    const rows = await this.db.insert(serviciosVeterinariosAnimales).values(data.map(d => ({ ...d, activo: 1 }))).returning()
    return rows
  }

  async update(id: number, data: Partial<Omit<VeterinarioAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<VeterinarioAnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    // Verify tenant before update
    const [row] = await this.db
      .update(serviciosVeterinariosAnimales)
      .set(updateData)
      .where(and(
        eq(serviciosVeterinariosAnimales.id, id),
        inArray(
          serviciosVeterinariosAnimales.servicioGrupalId,
          this.db.select({ id: serviciosVeterinariosGrupal.id })
            .from(serviciosVeterinariosGrupal)
            .where(eq(serviciosVeterinariosGrupal.predioId, predioId))
        )
      ))
      .returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    // Verify tenant before delete
    await this.db
      .update(serviciosVeterinariosAnimales)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(
        eq(serviciosVeterinariosAnimales.id, id),
        inArray(
          serviciosVeterinariosAnimales.servicioGrupalId,
          this.db.select({ id: serviciosVeterinariosGrupal.id })
            .from(serviciosVeterinariosGrupal)
            .where(eq(serviciosVeterinariosGrupal.predioId, predioId))
        )
      ))
    return true
  }
}
