import { injectable } from 'tsyringe'
import { eq, and } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import type { DbClient } from '@ganatrack/database'
import { notificacionesPreferencias } from '@ganatrack/database/schema'
import type {
  IPreferenciaRepository,
} from '../../domain/repositories/preferencia.repository.js'
import type {
  NotificacionPreferencia,
  NotificacionTipo,
  CrearPreferenciaParams,
} from '../../domain/entities/preferencia.entity.js'

@injectable()
export class DrizzlePreferenciaRepository implements IPreferenciaRepository {
  private readonly db: DbClient

  constructor(db: DbClient) {
    this.db = db
  }

  async findByUsuario(usuarioId: number): Promise<NotificacionPreferencia[]> {
    const rows = await this.db
      .select()
      .from(notificacionesPreferencias)
      .where(
        and(
          eq(notificacionesPreferencias.usuarioId, usuarioId),
          eq(notificacionesPreferencias.activo, 1)
        )
      )

    return rows as NotificacionPreferencia[]
  }

  async findByUsuarioAndTipo(
    usuarioId: number,
    tipo: NotificacionTipo
  ): Promise<NotificacionPreferencia | null> {
    const [row] = await this.db
      .select()
      .from(notificacionesPreferencias)
      .where(
        and(
          eq(notificacionesPreferencias.usuarioId, usuarioId),
          eq(notificacionesPreferencias.tipo, tipo),
          eq(notificacionesPreferencias.activo, 1)
        )
      )
      .limit(1)

    return row ?? null
  }

  async upsert(data: CrearPreferenciaParams): Promise<NotificacionPreferencia> {
    const existing = await this.findByUsuarioAndTipo(data.usuarioId, data.tipo)

    if (existing) {
      // Update existing
      const [row] = await this.db
        .update(notificacionesPreferencias)
        .set({
          canalInapp: data.canalInapp ?? existing.canalInapp,
          canalEmail: data.canalEmail ?? existing.canalEmail,
          canalPush: data.canalPush ?? existing.canalPush,
          diasAnticipacion: data.diasAnticipacion ?? existing.diasAnticipacion,
        })
        .where(eq(notificacionesPreferencias.id, existing.id))
        .returning()

      return row as NotificacionPreferencia
    }

    // Insert new
    const [row] = await this.db
      .insert(notificacionesPreferencias)
      .values({
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        canalInapp: data.canalInapp ?? 1,
        canalEmail: data.canalEmail ?? 1,
        canalPush: data.canalPush ?? 0,
        diasAnticipacion: data.diasAnticipacion ?? 7,
        activo: 1,
      })
      .returning()

    return row as NotificacionPreferencia
  }

  async getDefaultsForUsuario(usuarioId: number): Promise<NotificacionPreferencia[]> {
    // Returns default preferences for all tipos
    const existing = await this.findByUsuario(usuarioId)
    return existing
  }
}
