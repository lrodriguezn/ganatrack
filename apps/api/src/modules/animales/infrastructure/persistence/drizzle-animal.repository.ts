import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { animales } from '@ganatrack/database/schema'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { AnimalEntity } from '../../domain/entities/animal.entity.js'

@injectable()
export class DrizzleAnimalRepository implements IAnimalRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(predioId: number, opts: { page: number; limit: number; search?: string; potreroId?: number; estado?: number }) {
    const { page, limit, search, potreroId, estado } = opts
    const conditions = [eq(animales.predioId, predioId), eq(animales.activo, 1)]
    if (search) conditions.push(like(animales.codigo, `%${search}%`))
    if (potreroId) conditions.push(eq(animales.potreroId, potreroId))
    if (estado !== undefined) conditions.push(eq(animales.estadoAnimalKey, estado))
    const rows = await this.db.select().from(animales).where(and(...conditions)).orderBy(desc(animales.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(animales).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number, predioId: number): Promise<AnimalEntity | null> {
    const [row] = await this.db.select().from(animales).where(and(eq(animales.id, id), eq(animales.predioId, predioId), eq(animales.activo, 1))).limit(1)
    return row ?? null
  }

  async findByCodigo(codigo: string, predioId: number): Promise<AnimalEntity | null> {
    const [row] = await this.db.select().from(animales).where(and(eq(animales.codigo, codigo), eq(animales.predioId, predioId), eq(animales.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<AnimalEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnimalEntity> {
    const [row] = await this.db.insert(animales).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<AnimalEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AnimalEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(animales).set(updateData).where(eq(animales.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    await this.db.update(animales).set({ activo: 0, updatedAt: new Date() }).where(and(eq(animales.id, id), eq(animales.predioId, predioId)))
    return true
  }

  async getGenealogy(id: number, maxDepth = 5): Promise<{ ancestors: AnimalEntity[]; descendants: AnimalEntity[] }> {
    const ancestors: AnimalEntity[] = []
    const descendants: AnimalEntity[] = []
    const visited = new Set<number>()

    // Iterative ancestor traversal (upward)
    let currentId: number | null = id
    let depth = 0
    while (currentId && depth < maxDepth) {
      if (visited.has(currentId)) break
      visited.add(currentId)
      const [animal]: any = await this.db.select().from(animales).where(and(eq(animales.id, currentId), eq(animales.activo, 1))).limit(1)
      if (!animal) break
      if (animal.madreId) {
        const [madre]: any = await this.db.select().from(animales).where(and(eq(animales.id, animal.madreId), eq(animales.activo, 1))).limit(1)
        if (madre) ancestors.push(madre)
      }
      if (animal.padreId) {
        const [padre]: any = await this.db.select().from(animales).where(and(eq(animales.id, animal.padreId), eq(animales.activo, 1))).limit(1)
        if (padre) ancestors.push(padre)
      }
      currentId = animal.madreId
      depth++
    }

    // Iterative descendant traversal (downward) - children
    visited.clear()
    const queue: number[] = [id]
    depth = 0
    while (queue.length > 0 && depth < maxDepth) {
      const size = queue.length
      for (let i = 0; i < size; i++) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        const children: any = await this.db.select().from(animales).where(and(eq(animales.madreId, current), eq(animales.activo, 1)))
        children.forEach((c: any) => { descendants.push(c); queue.push(c.id) })
        const padres: any = await this.db.select().from(animales).where(and(eq(animales.padreId, current), eq(animales.activo, 1)))
        padres.forEach((p: any) => { if (!visited.has(p.id)) { descendants.push(p); queue.push(p.id) } })
      }
      depth++
    }

    return { ancestors, descendants }
  }
}
