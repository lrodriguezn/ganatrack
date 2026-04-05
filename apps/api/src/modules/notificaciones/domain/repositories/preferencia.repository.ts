import type { CrearPreferenciaParams, NotificacionPreferencia, NotificacionTipo } from '../entities/preferencia.entity.js'

export interface IPreferenciaRepository {
  findByUsuario(usuarioId: number): Promise<NotificacionPreferencia[]>
  findByUsuarioAndTipo(usuarioId: number, tipo: NotificacionTipo): Promise<NotificacionPreferencia | null>
  upsert(data: CrearPreferenciaParams): Promise<NotificacionPreferencia>
  getDefaultsForUsuario(usuarioId: number): Promise<NotificacionPreferencia[]>
}

export const PREFERENCIA_REPOSITORY = Symbol('IPreferenciaRepository')
