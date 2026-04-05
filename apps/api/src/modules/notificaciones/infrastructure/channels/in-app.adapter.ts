import { inject, injectable } from 'tsyringe'
import type { Notificacion } from '../../domain/entities/notificacion.entity.js'
import type { CanalResult, DestinatarioInfo, ICanalNotificacion } from '../../domain/services/canal-notificacion.interface.js'
import { NOTIFICACION_REPOSITORY } from '../../domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from '../../domain/repositories/notificacion.repository.js'

@injectable()
export class InAppChannelAdapter implements ICanalNotificacion {
  constructor(
    @inject(NOTIFICACION_REPOSITORY) private readonly repo: INotificacionRepository
  ) {}

  async enviar(notificacion: Notificacion, destinatarios: DestinatarioInfo[]): Promise<CanalResult> {
    try {
      // For in-app, the notification is already stored in DB
      // We just mark it as delivered by confirming it exists
      // The actual "delivery" is the user polling the API

      const deliveredCount = destinatarios.filter(d => d.preferencias.inapp).length

      return {
        success: true,
        channel: 'inapp',
        delivered: deliveredCount,
        failed: 0,
      }
    } catch (error) {
      return {
        success: false,
        channel: 'inapp',
        delivered: 0,
        failed: destinatarios.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }
}

export const INAPP_CHANNEL_ADAPTER = Symbol('InAppChannelAdapter')
