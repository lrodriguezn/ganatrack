// Domain entity for Push Token
export type Plataforma = 'android' | 'ios' | 'web'

export interface NotificacionPushToken {
  id: number
  usuarioId: number
  token: string
  plataforma: Plataforma
  createdAt: Date
  activo: number
}

export interface CrearPushTokenParams {
  usuarioId: number
  token: string
  plataforma: Plataforma
}
