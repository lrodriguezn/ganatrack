import { injectable } from 'tsyringe'
import { eq, and, desc, count, gte, lte } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { notificaciones } from '@ganatrack/database/schema'
import type {
  INotificacionRepository,
  ListNotificacionesOptions,
} from '../../domain/repositories/notificacion.repository.js'
import type {
  Notificacion,
  NotificacionTipo,
  CrearNotificacionParams,
} from '../../domain/entities/notificacion.entity.js'

@injectable()
export class DrizzleNotificacionRepository implements INotificacionRepository {
  private readonly db: DbClient

  constructor(db: DbClient) {
    this.db = db
  }

  async findById(id: number, predioId: number): Promise<Notificacion | null> {
    const [row] = await this.db
      .select()
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.id, id),
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.activo, 1)
        )
      )
      .limit(1)

    return row ?? null
  }

  async findByPredio(
    predioId: number,
    opts: ListNotificacionesOptions
  ): Promise<{ data: Notificacion[]; total: number }> {
    const { page, limit, leida, tipo } = opts
    const conditions: ReturnType<typeof eq>[] = [
      eq(notificaciones.predioId, predioId),
      eq(notificaciones.activo, 1),
    ]

    if (leida !== undefined) {
      conditions.push(eq(notificaciones.leida, leida))
    }

    if (tipo) {
      conditions.push(eq(notificaciones.tipo, tipo))
    }

    const rows = await this.db
      .select()
      .from(notificaciones)
      .where(and(...conditions))
      .orderBy(desc(notificaciones.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(notificaciones)
      .where(and(...conditions))

    return { data: rows as Notificacion[], total }
  }

  async countByTipo(predioId: number): Promise<{ tipo: NotificacionTipo; count: number }[]> {
    const rows = await this.db
      .select({
        tipo: notificaciones.tipo,
        count: count(),
      })
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.activo, 1),
          eq(notificaciones.leida, 0)
        )
      )
      .groupBy(notificaciones.tipo)

    return rows as { tipo: NotificacionTipo; count: number }[]
  }

  async countNoLeidas(predioId: number): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.activo, 1),
          eq(notificaciones.leida, 0)
        )
      )

    return total
  }

  async create(data: CrearNotificacionParams): Promise<Notificacion> {
    const [row] = await this.db
      .insert(notificaciones)
      .values({
        predioId: data.predioId,
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensaje: data.mensaje,
        entidadTipo: data.entidadTipo ?? null,
        entidadId: data.entidadId ?? null,
        leida: 0,
        fechaEvento: data.fechaEvento ?? null,
        activo: 1,
      })
      .returning()

    return row as Notificacion
  }

  async markAsRead(id: number, predioId: number): Promise<boolean> {
    const [row] = await this.db
      .update(notificaciones)
      .set({ leida: 1 })
      .where(
        and(
          eq(notificaciones.id, id),
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.activo, 1)
        )
      )
      .returning()

    return !!row
  }

  async markAllAsRead(predioId: number, usuarioId?: number): Promise<number> {
    const conditions = [
      eq(notificaciones.predioId, predioId),
      eq(notificaciones.activo, 1),
      eq(notificaciones.leida, 0),
    ]

    if (usuarioId !== undefined) {
      conditions.push(eq(notificaciones.usuarioId, usuarioId))
    }

    const result = await this.db
      .update(notificaciones)
      .set({ leida: 1 })
      .where(and(...conditions))

    return result.rowCount ?? 0
  }

  async softDelete(id: number, predioId: number): Promise<boolean> {
    const [row] = await this.db
      .update(notificaciones)
      .set({ activo: 0 })
      .where(
        and(
          eq(notificaciones.id, id),
          eq(notificaciones.predioId, predioId)
        )
      )
      .returning()

    return !!row
  }

  async existsSimilar(
    predioId: number,
    tipo: NotificacionTipo,
    entidadId: number,
    fechaEvento: Date
  ): Promise<boolean> {
    // Check for existing notification of same type for same entity on same day
    const startOfDay = new Date(fechaEvento)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(fechaEvento)
    endOfDay.setHours(23, 59, 59, 999)

    const [row] = await this.db
      .select({ id: notificaciones.id })
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.tipo, tipo),
          eq(notificaciones.entidadId, entidadId),
          eq(notificaciones.activo, 1),
          gte(notificaciones.fechaEvento, startOfDay),
          lte(notificaciones.fechaEvento, endOfDay)
        )
      )
      .limit(1)

    return !!row
  }
}
