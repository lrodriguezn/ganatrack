import type { CrearPushTokenParams, NotificacionPushToken, Plataforma } from '../entities/push-token.entity.js'

export interface IPushTokenRepository {
  findByUsuario(usuarioId: number): Promise<NotificacionPushToken[]>
  findByToken(token: string): Promise<NotificacionPushToken | null>
  create(data: CrearPushTokenParams): Promise<NotificacionPushToken>
  delete(usuarioId: number, token: string): Promise<boolean>
  deleteByToken(token: string): Promise<boolean>
}

export const PUSH_TOKEN_REPOSITORY = Symbol('IPushTokenRepository')
