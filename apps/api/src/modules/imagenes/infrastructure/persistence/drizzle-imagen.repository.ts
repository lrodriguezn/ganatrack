import { injectable } from 'tsyringe'
import { eq, and, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { imagenes } from '@ganatrack/database/schema'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { ImagenEntity } from '../../domain/entities/imagen.entity.js'

@injectable()
export class DrizzleImagenRepository implements IImagenRepository {
  private readonly db: DbClient
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const conditions = [eq(imagenes.predioId, predioId), eq(imagenes.activo, 1)]
    const rows = await this.db.select().from(imagenes).where(and(...conditions)).orderBy(desc(imagenes.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(imagenes).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<ImagenEntity | null> {
    const [row] = await this.db.select().from(imagenes).where(and(eq(imagenes.id, id), eq(imagenes.predioId, predioId), eq(imagenes.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<ImagenEntity, 'id' | 'createdAt'>): Promise<ImagenEntity> {
    const [row] = await this.db.insert(imagenes).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<ImagenEntity, 'id' | 'createdAt'>>): Promise<ImagenEntity | null> {
    const updateData: Record<string, unknown> = {}
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = data[k as keyof typeof data] })
    const [row] = await this.db.update(imagenes).set(updateData).where(eq(imagenes.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(imagenes).set({ activo: 0 }).where(and(eq(imagenes.id, id), eq(imagenes.predioId, predioId)))
    return true
  }
}
