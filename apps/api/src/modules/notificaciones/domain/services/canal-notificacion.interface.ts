// Channel interface for notification delivery
import type { Notificacion } from '../entities/notificacion.entity.js'
import type { PreferenciaCanal } from '../entities/preferencia.entity.js'

export interface DestinatarioInfo {
  usuarioId: number
  email: string | null
  pushTokens: string[]
  preferencias: PreferenciaCanal
}

export interface CanalResult {
  success: boolean
  channel: 'inapp' | 'email' | 'push'
  delivered: number
  failed: number
  errors?: string[]
}

export interface ICanalNotificacion {
  enviar(notificacion: Notificacion, destinatarios: DestinatarioInfo[]): Promise<CanalResult>
}

export const CANAL_INAPP = Symbol('ICanalInApp')
export const CANAL_EMAIL = Symbol('ICanalEmail')
export const CANAL_PUSH = Symbol('ICanalPush')
