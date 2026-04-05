import type { CrearNotificacionParams, Notificacion, NotificacionTipo } from '../entities/notificacion.entity.js'

export interface ListNotificacionesOptions {
  page: number
  limit: number
  leida?: number
  tipo?: NotificacionTipo
}

export interface INotificacionRepository {
  findById(id: number, predioId: number): Promise<Notificacion | null>
  findByPredio(
    predioId: number,
    opts: ListNotificacionesOptions
  ): Promise<{ data: Notificacion[]; total: number }>
  countByTipo(predioId: number): Promise<{ tipo: NotificacionTipo; count: number }[]>
  countNoLeidas(predioId: number): Promise<number>
  create(data: CrearNotificacionParams): Promise<Notificacion>
  markAsRead(id: number, predioId: number): Promise<boolean>
  markAllAsRead(predioId: number, usuarioId?: number): Promise<number>
  softDelete(id: number, predioId: number): Promise<boolean>
  existsSimilar(
    predioId: number,
    tipo: NotificacionTipo,
    entidadId: number,
    fechaEvento: Date
  ): Promise<boolean>
}

export const NOTIFICACION_REPOSITORY = Symbol('INotificacionRepository')
