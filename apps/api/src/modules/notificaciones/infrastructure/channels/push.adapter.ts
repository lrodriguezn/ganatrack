import { inject, injectable } from 'tsyringe'
import type { Notificacion } from '../../domain/entities/notificacion.entity.js'
import type { CanalResult, DestinatarioInfo, ICanalNotificacion } from '../../domain/services/canal-notificacion.interface.js'
import { PUSH_TOKEN_REPOSITORY } from '../../domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from '../../domain/repositories/push-token.repository.js'

// Push adapter using Firebase Cloud Messaging - stub implementation
// In production, this would use firebase-admin SDK

@injectable()
export class PushChannelAdapter implements ICanalNotificacion {
  constructor(
    @inject(PUSH_TOKEN_REPOSITORY) private readonly tokenRepo: IPushTokenRepository
  ) {}

  async enviar(notificacion: Notificacion, destinatarios: DestinatarioInfo[]): Promise<CanalResult> {
    const pushDestinatarios = destinatarios.filter(d => d.preferencias.push && d.pushTokens.length > 0)

    if (pushDestinatarios.length === 0) {
      return {
        success: true,
        channel: 'push',
        delivered: 0,
        failed: 0,
      }
    }

    try {
      // Collect all tokens
      const allTokens = pushDestinatarios.flatMap(d => d.pushTokens)

      if (allTokens.length === 0) {
        return {
          success: true,
          channel: 'push',
          delivered: 0,
          failed: 0,
        }
      }

      // In production, this would:
      // 1. Use firebase-admin SDK
      // 2. Send in batches of 500 (FCM limit)
      // 3. Handle invalid tokens (remove them from DB)
      // 4. Log delivery status

      // For now, just simulate successful delivery
      console.log(`[PushChannel] Would send notification "${notificacion.titulo}" to ${allTokens.length} devices`)

      return {
        success: true,
        channel: 'push',
        delivered: allTokens.length,
        failed: 0,
      }
    } catch (error) {
      return {
        success: false,
        channel: 'push',
        delivered: 0,
        failed: pushDestinatarios.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }
}

export const PUSH_CHANNEL_ADAPTER = Symbol('PushChannelAdapter')
