import { injectable } from 'tsyringe'
import type { Notificacion } from '../../domain/entities/notificacion.entity.js'
import type { ICanalNotificacion, CanalResult, DestinatarioInfo } from '../../domain/services/canal-notificacion.interface.js'

// Email adapter using nodemailer - stub implementation
// In production, this would use nodemailer with SMTP config

@injectable()
export class EmailChannelAdapter implements ICanalNotificacion {
  async enviar(notificacion: Notificacion, destinatarios: DestinatarioInfo[]): Promise<CanalResult> {
    const emailDestinatarios = destinatarios.filter(d => d.preferencias.email && d.email)

    if (emailDestinatarios.length === 0) {
      return {
        success: true,
        channel: 'email',
        delivered: 0,
        failed: 0,
      }
    }

    try {
      // In production, this would:
      // 1. Create nodemailer transporter with SMTP config
      // 2. Render email template based on notificacion.tipo
      // 3. Send emails in batch (nodemailer supports this)
      // 4. Log results

      // For now, just simulate successful delivery
      console.log(`[EmailChannel] Would send notification "${notificacion.titulo}" to ${emailDestinatarios.length} recipients`)

      return {
        success: true,
        channel: 'email',
        delivered: emailDestinatarios.length,
        failed: 0,
      }
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        delivered: 0,
        failed: emailDestinatarios.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }
}

export const EMAIL_CHANNEL_ADAPTER = Symbol('EmailChannelAdapter')
