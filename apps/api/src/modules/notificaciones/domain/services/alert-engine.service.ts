// Alert Engine Domain Service - evaluates 5 alert types
import { injectable } from 'tsyringe'
import type { CrearNotificacionParams, NotificacionTipo } from '../entities/notificacion.entity.js'
import type { PreferenciaCanal } from '../entities/preferencia.entity.js'

// Alert result types
export interface PartoProximo {
  animalId: number
  codigoAnimal: string
  nombreAnimal: string | null
  fechaParto: Date
  diasRestantes: number
}

export interface CeloEstimado {
  animalId: number
  codigoAnimal: string
  nombreAnimal: string | null
  fechaCelo: Date
  origen: 'post_parto' | 'post_servicio_fallido'
}

export interface InseminacionPendiente {
  animalId: number
  codigoAnimal: string
  nombreAnimal: string | null
  palpacionId: number
  fechaPalpacion: Date
  diasPendiente: number
}

export interface VacunaPendiente {
  animalId: number
  codigoAnimal: string
  nombreAnimal: string | null
  tratamientoId: number
  tratamiento: string | null
  fechaProxima: Date
  diasRestantes: number
}

export interface AnimalEnfermo {
  animalId: number
  codigoAnimal: string
  nombreAnimal: string | null
  estadoSalud: number
  ultimoTratamientoFecha: Date | null
  diasSinAtencion: number
}

export interface AlertaResultado<T> {
  tipo: NotificacionTipo
  alertas: T[]
  notificacionesCreadas: number
}

export interface AlertContext {
  predioId: number
  fechaReferencia: Date
  diasAnticipacion: number
}

export interface AlertaInfo {
  tipo: NotificacionTipo
  titulo: string
  mensaje: string
  entidadTipo: 'animal' | 'servicio'
  entidadId: number
  fechaEvento: Date
}

@injectable()
export class AlertEngineService {
  /**
   * Evaluates all 5 alert types for a given predio.
   * Returns an array of alerts detected.
   *
   * NOTE: This is a domain service stub. The actual alert evaluation logic
   * currently lives in AlertaSchedulerService (infrastructure) to avoid
   * circular dependencies. Full domain implementation pending - alert
   * evaluation should eventually move here from the scheduler.
   */
  async evaluarAlertas(ctx: AlertContext): Promise<AlertaInfo[]> {
    // TODO: Implement full alert evaluation logic in domain layer
    // Currently delegated to AlertaSchedulerService (infrastructure)
    // This domain service should own the evaluation rules and
    // use repositories to fetch data, while the scheduler orchestrates.
    return []
  }

  /**
   * Build notification title for PARTO_PROXIMO alert
   */
  buildTituloPartoProximo(codigoAnimal: string, diasRestantes: number): string {
    if (diasRestantes === 0) {
      return `Parto esperado hoy — Animal ${codigoAnimal}`
    }
    if (diasRestantes === 1) {
      return `Parto mañana — Animal ${codigoAnimal}`
    }
    return `Parto en ${diasRestantes} días — Animal ${codigoAnimal}`
  }

  /**
   * Build notification title for CELO_ESTIMADO alert
   */
  buildTituloCeloEstimado(codigoAnimal: string): string {
    return `Celo estimado — Animal ${codigoAnimal}`
  }

  /**
   * Build notification title for INSEMINACION_PENDIENTE alert
   */
  buildTituloInseminacionPendiente(codigoAnimal: string, diasPendiente: number): string {
    return `Inseminación pendiente — Animal ${codigoAnimal} (${diasPendiente} días)`
  }

  /**
   * Build notification title for VACUNA_PENDIENTE alert
   */
  buildTituloVacunaPendiente(codigoAnimal: string, tratamiento: string | null): string {
    return `Vacuna próxima — ${tratamiento ?? 'Tratamiento'} Animal ${codigoAnimal}`
  }

  /**
   * Build notification title for ANIMAL_ENFERMO alert
   */
  buildTituloAnimalEnfermo(codigoAnimal: string): string {
    return `Animal enfermo sin atención — ${codigoAnimal}`
  }
}

export const ALERT_ENGINE_SERVICE = Symbol('AlertEngineService')
