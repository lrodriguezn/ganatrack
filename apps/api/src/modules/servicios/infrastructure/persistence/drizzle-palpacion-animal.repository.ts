import { injectable } from 'tsyringe'
import { and, eq, inArray } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { serviciosPalpacionesAnimales, serviciosPalpacionesGrupal } from '@ganatrack/database/schema'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import type { PalpacionAnimalEntity } from '../../domain/entities/palpacion.entity.js'

@injectable()
export class DrizzlePalpacionAnimalRepository implements IPalpacionAnimalRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findByGrupalId(grupalId: number): Promise<PalpacionAnimalEntity[]> {
    return await this.db.select().from(serviciosPalpacionesAnimales).where(and(eq(serviciosPalpacionesAnimales.palpacionGrupalId, grupalId), eq(serviciosPalpacionesAnimales.activo, 1)))
  }

  async findById(id: number, predioId: number): Promise<PalpacionAnimalEntity | null> {
    // Verify tenant via parent group
    const [row] = await this.db
      .select({ animal: serviciosPalpacionesAnimales })
      .from(serviciosPalpacionesAnimales)
      .innerJoin(serviciosPalpacionesGrupal, eq(serviciosPalpacionesAnimales.palpacionGrupalId, serviciosPalpacionesGrupal.id))
      .where(and(
        eq(serviciosPalpacionesAnimales.id, id),
        eq(serviciosPalpacionesAnimales.activo, 1),
        eq(serviciosPalpacionesGrupal.predioId, predioId)
      ))
      .limit(1)
    return row?.animal ?? null
  }

  async create(data: Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PalpacionAnimalEntity> {
    const [row] = await this.db.insert(serviciosPalpacionesAnimales).values({ ...data, activo: 1 }).returning()
    return row
  }

  async createMany(data: Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PalpacionAnimalEntity[]> {
    if (data.length === 0) return []
    const rows = await this.db.insert(serviciosPalpacionesAnimales).values(data.map(d => ({ ...d, activo: 1 }))).returning()
    return rows
  }

  async update(id: number, data: Partial<Omit<PalpacionAnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>, predioId: number): Promise<PalpacionAnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    // Verify tenant before update - only update if belongs to correct predioId
    const [row] = await this.db
      .update(serviciosPalpacionesAnimales)
      .set(updateData)
      .where(and(
        eq(serviciosPalpacionesAnimales.id, id),
        inArray(
          serviciosPalpacionesAnimales.palpacionGrupalId,
          this.db.select({ id: serviciosPalpacionesGrupal.id })
            .from(serviciosPalpacionesGrupal)
            .where(eq(serviciosPalpacionesGrupal.predioId, predioId))
        )
      ))
      .returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    // Verify tenant before delete - only delete if belongs to correct predioId
    await this.db
      .update(serviciosPalpacionesAnimales)
      .set({ activo: 0, updatedAt: new Date() })
      .where(and(
        eq(serviciosPalpacionesAnimales.id, id),
        inArray(
          serviciosPalpacionesAnimales.palpacionGrupalId,
          this.db.select({ id: serviciosPalpacionesGrupal.id })
            .from(serviciosPalpacionesGrupal)
            .where(eq(serviciosPalpacionesGrupal.predioId, predioId))
        )
      ))
    return true
  }
}
