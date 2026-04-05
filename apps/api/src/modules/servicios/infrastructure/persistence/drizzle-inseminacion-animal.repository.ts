import { injectable } from 'tsyringe'
import { and, eq, inArray } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosInseminacionAnimales, serviciosInseminacionGrupal } from '@ganatrack/database/schema'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { InseminacionAnimalEntity } from '../../domain/entities/inseminacion.entity.js'

@injectable()
export class DrizzleInseminacionAnimalRepository implements IInseminacionAnimalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByGrupalId(grupalId: number): Promise<InseminacionAnimalEntity[]> {
    return await this.db.select().from(serviciosInseminacionAnimales).where(and(eq(serviciosInseminacionAnimales.inseminacionGrupalId, grupalId), eq(serviciosInseminacionAnimales.activo, 1)))
  }

  async findById(id: number, predioId: number): Promise<InseminacionAnimalEntity | null> {
    // Verify tenant via parent group
    const [row] = await this.db
      .select({ animal: serviciosInseminacionAnimales })
      .from(serviciosInseminacionAnimales)
      .innerJoin(serviciosInseminacionGrupal, eq(serviciosInseminacionAnimales.inseminacionGrupalId, serviciosInseminacionGrupal.id))
      .where(and(
        eq(serviciosInseminacionAnimales.id, id),
        eq(serviciosInseminacionAnimales.activo, 1),
        eq(serviciosInseminacionGrupal.predioId, predioId)
      ))
      .limit(1)
    return row?.animal ?? null
  }

  async create(data: Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<InseminacionAnimalEntity> {
    const [row] = await this.db.insert(serviciosInseminacionAnimales).values({ ...data, activo: 1 }).returning()
    return row
  }

  async createMany(data: Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<InseminacionAnimalEntity[]> {
    if (data.length === 0) return []
    const rows = await this.db.insert(serviciosInseminacionAnimales).values(data.map(d => ({ ...d, activo: 1 }))).returning()
    return rows
  }

  async update(id: number, data: Partial<Omit<InseminacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<InseminacionAnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    // Verify tenant before update
    const [row] = await this.db
      .update(serviciosInseminacionAnimales)
      .set(updateData)
      .where(and(
        eq(serviciosInseminacionAnimales.id, id),
        inArray(
          serviciosInseminacionAnimales.inseminacionGrupalId,
          this.db.select({ id: serviciosInseminacionGrupal.id })
            .from(serviciosInseminacionGrupal)
            .where(eq(serviciosInseminacionGrupal.predioId, predioId))
        )
      ))
      .returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    // Verify tenant before delete
    await this.db
      .update(serviciosInseminacionAnimales)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(
        eq(serviciosInseminacionAnimales.id, id),
        inArray(
          serviciosInseminacionAnimales.inseminacionGrupalId,
          this.db.select({ id: serviciosInseminacionGrupal.id })
            .from(serviciosInseminacionGrupal)
            .where(eq(serviciosInseminacionGrupal.predioId, predioId))
        )
      ))
    return true
  }
}
