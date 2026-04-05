import { injectable } from 'tsyringe'
import { and, count, desc, eq } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { reportesExportaciones } from '@ganatrack/database/schema'
import type { IExportJobRepository } from '../../domain/repositories/export-job.repository.js'
import type { ExportEstado, ReporteExportacionEntity } from '../../domain/entities/reporte-exportacion.entity.js'

@injectable()
export class DrizzleExportJobRepository implements IExportJobRepository {
  private readonly db: any

  constructor(db: DbClient) {
    this.db = db
  }

  async create(data: {
    tipo: string
    formato: string
    parametros: string | null
    predioId: number
    usuarioId: number
  }): Promise<ReporteExportacionEntity> {
    const [row] = await this.db
      .insert(reportesExportaciones)
      .values({
        tipo: data.tipo,
        formato: data.formato,
        parametros: data.parametros,
        estado: 'pendiente',
        activo: 1,
        predioId: data.predioId,
        usuarioId: data.usuarioId,
      })
      .returning()
    return row
  }

  async findById(id: number, predioId: number): Promise<ReporteExportacionEntity | null> {
    const [row] = await this.db
      .select()
      .from(reportesExportaciones)
      .where(
        and(
          eq(reportesExportaciones.id, id),
          eq(reportesExportaciones.predioId, predioId),
          eq(reportesExportaciones.activo, 1)
        )
      )
      .limit(1)
    return row ?? null
  }

  async findByIdAndUsuario(id: number, usuarioId: number): Promise<ReporteExportacionEntity | null> {
    const [row] = await this.db
      .select()
      .from(reportesExportaciones)
      .where(
        and(
          eq(reportesExportaciones.id, id),
          eq(reportesExportaciones.usuarioId, usuarioId),
          eq(reportesExportaciones.activo, 1)
        )
      )
      .limit(1)
    return row ?? null
  }

  async findByUsuarioId(
    usuarioId: number,
    opts: { page: number; limit: number }
  ): Promise<{ data: ReporteExportacionEntity[]; total: number }> {
    const conditions = [
      eq(reportesExportaciones.usuarioId, usuarioId),
      eq(reportesExportaciones.activo, 1),
    ]

    const rows = await this.db
      .select()
      .from(reportesExportaciones)
      .where(and(...conditions))
      .orderBy(desc(reportesExportaciones.createdAt))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(reportesExportaciones)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async findByPredioId(
    predioId: number,
    opts: { page: number; limit: number }
  ): Promise<{ data: ReporteExportacionEntity[]; total: number }> {
    const conditions = [
      eq(reportesExportaciones.predioId, predioId),
      eq(reportesExportaciones.activo, 1),
    ]

    const rows = await this.db
      .select()
      .from(reportesExportaciones)
      .where(and(...conditions))
      .orderBy(desc(reportesExportaciones.createdAt))
      .limit(opts.limit)
      .offset((opts.page - 1) * opts.limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(reportesExportaciones)
      .where(and(...conditions))

    return { data: rows, total }
  }

  async updateStatus(id: number, estado: ExportEstado, rutaArchivo?: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      estado,
      updatedAt: new Date(),
    }
    if (rutaArchivo !== undefined) {
      updateData.rutaArchivo = rutaArchivo
    }

    await this.db
      .update(reportesExportaciones)
      .set(updateData)
      .where(eq(reportesExportaciones.id, id))
  }

  async softDelete(id: number, usuarioId: number): Promise<boolean> {
    await this.db
      .update(reportesExportaciones)
      .set({ activo: 0, updatedAt: new Date() })
      .where(
        and(
          eq(reportesExportaciones.id, id),
          eq(reportesExportaciones.usuarioId, usuarioId)
        )
      )
    return true
  }
}
