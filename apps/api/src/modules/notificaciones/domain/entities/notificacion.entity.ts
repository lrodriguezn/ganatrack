// Domain entity for Notification
export type NotificacionTipo =
  | 'PARTO_PROXIMO'
  | 'CELO_ESTIMADO'
  | 'INSEMINACION_PENDIENTE'
  | 'VACUNA_PENDIENTE'
  | 'ANIMAL_ENFERMO'

export interface Notificacion {
  id: number
  predioId: number
  usuarioId: number | null
  tipo: NotificacionTipo
  titulo: string
  mensaje: string
  entidadTipo: 'animal' | 'servicio' | null
  entidadId: number | null
  leida: number // 0 | 1
  fechaEvento: Date | null
  createdAt: Date
  activo: number
}

export interface CrearNotificacionParams {
  predioId: number
  usuarioId: number | null
  tipo: NotificacionTipo
  titulo: string
  mensaje: string
  entidadTipo?: 'animal' | 'servicio' | null
  entidadId?: number | null
  fechaEvento?: Date | null
}
