import { injectable } from 'tsyringe'
import { eq, and, like, desc, count } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { diagnosticosVeterinarios } from '@ganatrack/database/schema'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { DiagnosticoVeterinarioEntity } from '../../domain/entities/diagnostico-veterinario.entity.js'

@injectable()
export class DrizzleDiagnosticoVeterinarioRepository implements IDiagnosticoVeterinarioRepository {
  private readonly db: any
  constructor(db: DbClient) { this.db = db }

  async findAll(opts: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = opts
    const conditions = [eq(diagnosticosVeterinarios.activo, 1)]
    if (search) conditions.push(like(diagnosticosVeterinarios.nombre, `%${search}%`))
    const rows = await this.db.select().from(diagnosticosVeterinarios).where(and(...conditions)).orderBy(desc(diagnosticosVeterinarios.createdAt)).limit(limit).offset((page - 1) * limit)
    const [{ total }] = await this.db.select({ total: count() }).from(diagnosticosVeterinarios).where(and(...conditions))
    return { data: rows, total }
  }

  async findById(id: number): Promise<DiagnosticoVeterinarioEntity | null> {
    const [row] = await this.db.select().from(diagnosticosVeterinarios).where(and(eq(diagnosticosVeterinarios.id, id), eq(diagnosticosVeterinarios.activo, 1))).limit(1)
    return row ?? null
  }

  async create(data: Omit<DiagnosticoVeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiagnosticoVeterinarioEntity> {
    const [row] = await this.db.insert(diagnosticosVeterinarios).values({ ...data, activo: 1 }).returning()
    return row
  }

  async update(id: number, data: Partial<Omit<DiagnosticoVeterinarioEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<DiagnosticoVeterinarioEntity | null> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    Object.keys(data).forEach(k => { if (k !== 'id') updateData[k] = (data as any)[k] })
    const [row] = await this.db.update(diagnosticosVeterinarios).set(updateData).where(eq(diagnosticosVeterinarios.id, id)).returning()
    return row ?? null
  }

  async softDelete(id: number): Promise<boolean> {
    await this.db.update(diagnosticosVeterinarios).set({ activo: 0, updatedAt: new Date() }).where(eq(diagnosticosVeterinarios.id, id))
    return true
  }
}
