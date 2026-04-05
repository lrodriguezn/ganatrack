import { injectable } from 'tsyringe'
import { eq, and } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animalesImagenes } from '@ganatrack/database/schema'
import type { IAnimalImagenRepository } from '../../domain/repositories/animal-imagen.repository.js'
import type { AnimalImagenEntity } from '../../domain/entities/animal.entity.js'

@injectable()
export class DrizzleAnimalImagenRepository implements IAnimalImagenRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findByAnimal(animalId: number): Promise<AnimalImagenEntity[]> {
    return await this.db.select().from(animalesImagenes).where(and(eq(animalesImagenes.animalId, animalId), eq(animalesImagenes.activo, 1)))
  }

  async findByImagen(imagenId: number): Promise<AnimalImagenEntity[]> {
    return await this.db.select().from(animalesImagenes).where(and(eq(animalesImagenes.imagenId, imagenId), eq(animalesImagenes.activo, 1)))
  }

  async create(data: { animalId: number; imagenId: number }): Promise<AnimalImagenEntity> {
    const [row] = await this.db.insert(animalesImagenes).values({ ...data, activo: 1 }).returning()
    return row
  }

  async delete(animalId: number, imagenId: number): Promise<boolean> {
    await this.db.update(animalesImagenes).set({ activo: 0 }).where(and(eq(animalesImagenes.animalId, animalId), eq(animalesImagenes.imagenId, imagenId)))
    return true
  }
}
