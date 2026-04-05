import type { NotificacionTipo } from '../../domain/entities/notificacion.entity.js'
import type { Plataforma } from '../../domain/entities/push-token.entity.js'

// ============================================================================
// Request DTOs
// ============================================================================

export interface ListNotificacionesQueryDto {
  page?: number
  limit?: number
  leida?: number // 0 or 1
  tipo?: NotificacionTipo
}

export interface MarcarLeidaParamsDto {
  id: number
}

export interface EliminarNotificacionParamsDto {
  id: number
}

export interface ActualizarPreferenciaBodyDto {
  inapp: boolean
  email: boolean
  push: boolean
  diasAnticipacion?: number
}

export interface RegistrarPushTokenBodyDto {
  token: string
  plataforma: Plataforma
}

export interface EvaluarAlertasBodyDto {
  predioId?: number // If not provided, evaluates all active predios
}

export interface PushTokenParamsDto {
  token: string
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface NotificacionResponseDto {
  id: number
  tipo: NotificacionTipo
  titulo: string
  mensaje: string
  leida: boolean
  fechaEvento: string | null
  fechaCreacion: string
  entidadTipo: 'animal' | 'servicio' | null
  entidadId: number | null
}

export interface NotificacionResumenDto {
  noLeidas: number
  porTipo: { tipo: NotificacionTipo; count: number }[]
}

export interface PreferenciaResponseDto {
  tipo: NotificacionTipo
  canal: {
    inapp: boolean
    email: boolean
    push: boolean
  }
  diasAnticipacion: number
}

export interface PushTokenResponseDto {
  id: number
  token: string
  plataforma: Plataforma
  createdAt: string
}

export interface EvaluarAlertasResponseDto {
  notificacionesCreadas: number
  prediosEvaluados: number
  tiempoEjecucionMs: number
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

// ============================================================================
// Notification type constants
// ============================================================================

export const NOTIFICACION_TIPOS: NotificacionTipo[] = [
  'PARTO_PROXIMO',
  'CELO_ESTIMADO',
  'INSEMINACION_PENDIENTE',
  'VACUNA_PENDIENTE',
  'ANIMAL_ENFERMO',
]

export const NOTIFICACION_TIPO_LABELS: Record<NotificacionTipo, string> = {
  PARTO_PROXIMO: 'Parto Próximo',
  CELO_ESTIMADO: 'Celo Estimado',
  INSEMINACION_PENDIENTE: 'Inseminación Pendiente',
  VACUNA_PENDIENTE: 'Vacuna Pendiente',
  ANIMAL_ENFERMO: 'Animal Enfermo',
}
