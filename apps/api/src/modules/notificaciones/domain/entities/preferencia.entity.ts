// Domain entity for Notification Preference
import type { NotificacionTipo } from './notificacion.entity.js'
export type { NotificacionTipo } from './notificacion.entity.js'

export interface PreferenciaCanal {
  inapp: boolean
  email: boolean
  push: boolean
}

export interface NotificacionPreferencia {
  id: number
  usuarioId: number
  tipo: NotificacionTipo
  canalInapp: number // 0 | 1
  canalEmail: number // 0 | 1
  canalPush: number // 0 | 1
  diasAnticipacion: number
  activo: number
}

export interface CrearPreferenciaParams {
  usuarioId: number
  tipo: NotificacionTipo
  canalInapp?: number
  canalEmail?: number
  canalPush?: number
  diasAnticipacion?: number
}
