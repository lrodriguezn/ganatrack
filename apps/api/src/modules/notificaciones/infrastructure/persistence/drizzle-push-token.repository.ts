import { injectable } from 'tsyringe'
import { eq, and } from 'drizzle-orm'
import type { DbClient } from '@ganatrack/database'
import { notificacionesPushTokens } from '@ganatrack/database/schema'
import type { IPushTokenRepository } from '../../domain/repositories/push-token.repository.js'
import type {
  NotificacionPushToken,
  CrearPushTokenParams,
} from '../../domain/entities/push-token.entity.js'

@injectable()
export class DrizzlePushTokenRepository implements IPushTokenRepository {
  private readonly db: DbClient

  constructor(db: DbClient) {
    this.db = db
  }

  async findByUsuario(usuarioId: number): Promise<NotificacionPushToken[]> {
    const rows = await this.db
      .select()
      .from(notificacionesPushTokens)
      .where(
        and(
          eq(notificacionesPushTokens.usuarioId, usuarioId),
          eq(notificacionesPushTokens.activo, 1)
        )
      )

    return rows as NotificacionPushToken[]
  }

  async findByToken(token: string): Promise<NotificacionPushToken | null> {
    const [row] = await this.db
      .select()
      .from(notificacionesPushTokens)
      .where(
        and(
          eq(notificacionesPushTokens.token, token),
          eq(notificacionesPushTokens.activo, 1)
        )
      )
      .limit(1)

    return row ?? null
  }

  async create(data: CrearPushTokenParams): Promise<NotificacionPushToken> {
    const [row] = await this.db
      .insert(notificacionesPushTokens)
      .values({
        usuarioId: data.usuarioId,
        token: data.token,
        plataforma: data.plataforma,
        activo: 1,
      })
      .returning()

    return row as NotificacionPushToken
  }

  async delete(usuarioId: number, token: string): Promise<boolean> {
    const [row] = await this.db
      .update(notificacionesPushTokens)
      .set({ activo: 0 })
      .where(
        and(
          eq(notificacionesPushTokens.usuarioId, usuarioId),
          eq(notificacionesPushTokens.token, token)
        )
      )
      .returning()

    return !!row
  }

  async deleteByToken(token: string): Promise<boolean> {
    const [row] = await this.db
      .update(notificacionesPushTokens)
      .set({ activo: 0 })
      .where(eq(notificacionesPushTokens.token, token))
      .returning()

    return !!row
  }
}
