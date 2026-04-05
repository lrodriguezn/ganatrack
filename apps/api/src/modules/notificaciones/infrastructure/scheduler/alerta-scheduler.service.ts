import { injectable } from 'tsyringe'
import type { DbClient } from '@ganatrack/database'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import {
  animales,
  predios,
  serviciosInseminacionAnimales,
  serviciosPalpacionesAnimales,
  serviciosVeterinariosAnimales,
} from '@ganatrack/database/schema'
import type { NotificacionTipo } from '../../domain/entities/notificacion.entity.js'
import { notificaciones } from '@ganatrack/database/schema'

export interface AlertaDetectada {
  tipo: NotificacionTipo
  titulo: string
  mensaje: string
  entidadTipo: 'animal' | 'servicio'
  entidadId: number
  fechaEvento: Date
  diasAnticipacion: number
}

@injectable()
export class AlertaSchedulerService {
  private readonly db: DbClient

  constructor(db: DbClient) {
    this.db = db
  }

  /**
   * Runs the daily alert evaluation for all active predios.
   * Scheduled to run at 00:30 daily via node-cron.
   * @param targetPredioId Optional - if provided, only evaluates this specific predio
   */
  async ejecutarEvaluacionDiaria(targetPredioId?: number): Promise<{
    notificacionesCreadas: number
    prediosEvaluados: number
    tiempoMs: number
  }> {
    const startTime = Date.now()
    let notificacionesCreadas = 0
    let prediosEvaluados = 0

    // Get active predios - filter to single target if specified
    let prediosQuery = this.db
      .select()
      .from(predios)
      .where(eq(predios.activo, 1))

    if (targetPredioId !== undefined) {
      prediosQuery = this.db
        .select()
        .from(predios)
        .where(and(eq(predios.activo, 1), eq(predios.id, targetPredioId)))
    }

    const prediosActivos = await prediosQuery

    for (const predio of prediosActivos) {
      try {
        const alertas = await this.evaluarPredio(predio.id)

        for (const alerta of alertas) {
          const existe = await this.existeNotificacionSimilar(
            predio.id,
            alerta.tipo,
            alerta.entidadId
          )

          if (!existe) {
            await this.crearNotificacion(predio.id, alerta)
            notificacionesCreadas++
          }
        }

        prediosEvaluados++
      } catch (error) {
        console.error(`[Scheduler] Error evaluando predio ${predio.id}:`, error)
      }
    }

    return {
      notificacionesCreadas,
      prediosEvaluados,
      tiempoMs: Date.now() - startTime,
    }
  }

  private async evaluarPredio(predioId: number): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 7) // 7 days ahead

    // 1. Evaluate PARTO_PROXIMO alerts
    const partosProximos = await this.evaluarPartosProximos(predioId, today, endDate)
    alertas.push(...partosProximos)

    // 2. Evaluate CELO_ESTIMADO alerts
    const celosEstimados = await this.evaluarCelosEstimados(predioId, today)
    alertas.push(...celosEstimados)

    // 3. Evaluate INSEMINACION_PENDIENTE alerts
    const inseminacionesPendientes = await this.evaluarInseminacionesPendientes(predioId)
    alertas.push(...inseminacionesPendientes)

    // 4. Evaluate VACUNA_PENDIENTE alerts
    const vacunasPendientes = await this.evaluarVacunasPendientes(predioId, today, endDate)
    alertas.push(...vacunasPendientes)

    // 5. Evaluate ANIMAL_ENFERMO alerts
    const animalesEnfermos = await this.evaluarAnimalesEnfermos(predioId, today)
    alertas.push(...animalesEnfermos)

    return alertas
  }

  private async evaluarPartosProximos(
    predioId: number,
    startDate: Date,
    endDate: Date
  ): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []

    // Query palpaciones with fechaParto between startDate and endDate
    const palpaciones = await this.db
      .select({
        id: serviciosPalpacionesAnimales.id,
        animalId: serviciosPalpacionesAnimales.animalId,
        fechaParto: serviciosPalpacionesAnimales.fechaParto,
        animalCodigo: animales.codigo,
        animalNombre: animales.nombre,
      })
      .from(serviciosPalpacionesAnimales)
      .leftJoin(animales, eq(serviciosPalpacionesAnimales.animalId, animales.id))
      .where(
        and(
          eq(animales.predioId, predioId),
          eq(serviciosPalpacionesAnimales.activo, 1),
          eq(animales.activo, 1),
          gte(serviciosPalpacionesAnimales.fechaParto, startDate),
          lte(serviciosPalpacionesAnimales.fechaParto, endDate)
        )
      )

    for (const palpacion of palpaciones) {
      if (!palpacion.fechaParto) continue

      const diasRestantes = Math.ceil(
        (palpacion.fechaParto.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      let titulo: string
      if (diasRestantes === 0) {
        titulo = `Parto esperado hoy — Animal ${palpacion.animalCodigo}`
      } else if (diasRestantes === 1) {
        titulo = `Parto mañana — Animal ${palpacion.animalCodigo}`
      } else {
        titulo = `Parto en ${diasRestantes} días — Animal ${palpacion.animalCodigo}`
      }

      alertas.push({
        tipo: 'PARTO_PROXIMO',
        titulo,
        mensaje: `El animal ${palpacion.animalCodigo} tiene un parto estimado para el ${palpacion.fechaParto.toLocaleDateString()}.`,
        entidadTipo: 'animal',
        entidadId: palpacion.animalId,
        fechaEvento: palpacion.fechaParto,
        diasAnticipacion: diasRestantes,
      })
    }

    return alertas
  }

  private async evaluarCelosEstimados(
    predioId: number,
    today: Date
  ): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []

    // Look for animals that gave birth 21 days ago (potential celo)
    // AND have no subsequent insemination or service
    const fechaCeloEsperadoMin = new Date(today)
    fechaCeloEsperadoMin.setDate(fechaCeloEsperadoMin.getDate() - 22) // 21 days ago + 1

    const fechaCeloEsperadoMax = new Date(today)
    fechaCeloEsperadoMax.setDate(fechaCeloEsperadoMax.getDate() - 20) // 21 days ago - 1

    // Query partos that happened 20-22 days ago
    const partos = await this.db
      .select({
        id: serviciosPalpacionesAnimales.id,
        animalId: serviciosPalpacionesAnimales.animalId,
        fecha: serviciosPalpacionesAnimales.fecha,
        animalCodigo: animales.codigo,
        animalNombre: animales.nombre,
      })
      .from(serviciosPalpacionesAnimales)
      .leftJoin(animales, eq(serviciosPalpacionesAnimales.animalId, animales.id))
      .where(
        and(
          eq(animales.predioId, predioId),
          eq(serviciosPalpacionesAnimales.activo, 1),
          eq(animales.activo, 1)
        )
      )

    // Batch fetch all inseminaciones for this predio to avoid N+1
    const allInseminaciones = await this.db
      .select({
        animalId: serviciosInseminacionAnimales.animalId,
        fecha: serviciosInseminacionAnimales.fecha,
      })
      .from(serviciosInseminacionAnimales)
      .where(
        and(
          eq(serviciosInseminacionAnimales.predioId, predioId),
          eq(serviciosInseminacionAnimales.activo, 1)
        )
      )

    // Build a map: animalId -> latest inseminacion fecha
    const inseminacionMap = new Map<number, Date>()
    for (const insem of allInseminaciones) {
      if (insem.fecha) {
        const existing = inseminacionMap.get(insem.animalId)
        if (!existing || insem.fecha > existing) {
          inseminacionMap.set(insem.animalId, insem.fecha)
        }
      }
    }

    for (const parto of partos) {
      if (!parto.fecha) continue

      const diasPostParto = Math.ceil(
        (today.getTime() - parto.fecha.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Check if we're around day 21 (18-24 days range for flexibility)
      if (diasPostParto >= 18 && diasPostParto <= 24) {
        // Check if there's a subsequent inseminacion using the map
        const ultimaInseminacion = inseminacionMap.get(parto.animalId)
        const tieneInseminacion = ultimaInseminacion && ultimaInseminacion >= parto.fecha

        if (!tieneInseminacion) {
          const fechaCelo = new Date(parto.fecha)
          fechaCelo.setDate(fechaCelo.getDate() + 21)

          alertas.push({
            tipo: 'CELO_ESTIMADO',
            titulo: `Celo estimado — Animal ${parto.animalCodigo}`,
            mensaje: `Se estima que el animal ${parto.animalCodigo} entrará en celo aproximadamente el ${fechaCelo.toLocaleDateString()} (21 días post-parto).`,
            entidadTipo: 'animal',
            entidadId: parto.animalId,
            fechaEvento: fechaCelo,
            diasAnticipacion: diasPostParto - 21,
          })
        }
      }
    }

    return alertas
  }

  private async evaluarInseminacionesPendientes(
    predioId: number
  ): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Look for palpaciones with diagnostico "pendiente" (diagnosticoId = some placeholder value)
    // that are older than 10 days without a subsequent inseminacion
    const palpacionesPendientes = await this.db
      .select({
        id: serviciosPalpacionesAnimales.id,
        animalId: serviciosPalpacionesAnimales.animalId,
        diagnosticoId: serviciosPalpacionesAnimales.diagnosticoId,
        fecha: serviciosPalpacionesAnimales.fecha,
        animalCodigo: animales.codigo,
        animalNombre: animales.nombre,
      })
      .from(serviciosPalpacionesAnimales)
      .leftJoin(animales, eq(serviciosPalpacionesAnimales.animalId, animales.id))
      .where(
        and(
          eq(animales.predioId, predioId),
          eq(serviciosPalpacionesAnimales.activo, 1),
          eq(animales.activo, 1)
        )
      )

    // Batch fetch all inseminaciones for this predio to avoid N+1
    const allInseminaciones = await this.db
      .select({
        animalId: serviciosInseminacionAnimales.animalId,
        fecha: serviciosInseminacionAnimales.fecha,
      })
      .from(serviciosInseminacionAnimales)
      .where(
        and(
          eq(serviciosInseminacionAnimales.predioId, predioId),
          eq(serviciosInseminacionAnimales.activo, 1)
        )
      )

    // Build a map: animalId -> latest inseminacion fecha
    const inseminacionMap = new Map<number, Date>()
    for (const insem of allInseminaciones) {
      if (insem.fecha) {
        const existing = inseminacionMap.get(insem.animalId)
        if (!existing || insem.fecha > existing) {
          inseminacionMap.set(insem.animalId, insem.fecha)
        }
      }
    }

    for (const palpacion of palpacionesPendientes) {
      if (!palpacion.fecha) continue

      // If diagnostico is null or indicates "pendiente" (typically diagnosticoId = 1 means pending)
      // and there's no subsequent inseminacion
      if (palpacion.diagnosticoId === 1) { // 1 = Pendiente in typical config
        const diasPendiente = Math.ceil(
          (today.getTime() - palpacion.fecha.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diasPendiente >= 10) {
          // Check if there's a subsequent inseminacion using the map
          const ultimaInseminacion = inseminacionMap.get(palpacion.animalId)
          const tieneInseminacion = ultimaInseminacion && ultimaInseminacion >= palpacion.fecha

          if (!tieneInseminacion) {
            alertas.push({
              tipo: 'INSEMINACION_PENDIENTE',
              titulo: `Inseminación pendiente — Animal ${palpacion.animalCodigo} (${diasPendiente} días)`,
              mensaje: `El animal ${palpacion.animalCodigo} tiene un diagnóstico de palpación pendiente desde hace ${diasPendiente} días sin una inseminación registrada.`,
              entidadTipo: 'servicio',
              entidadId: palpacion.id,
              fechaEvento: palpacion.fecha,
              diasAnticipacion: diasPendiente,
            })
          }
        }
      }
    }

    return alertas
  }

  private async evaluarVacunasPendientes(
    predioId: number,
    startDate: Date,
    endDate: Date
  ): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []

    // Note: The schema doesn't have a "fecha_proxima" field in serviciosVeterinariosAnimales
    // This alert type would require extending the schema or using fecha + interval
    // For now, we'll check for treatments with "vacuna" in the tratamiento field

    const tratamientos = await this.db
      .select({
        id: serviciosVeterinariosAnimales.id,
        animalId: serviciosVeterinariosAnimales.animalId,
        tratamiento: serviciosVeterinariosAnimales.tratamiento,
        fecha: serviciosVeterinariosAnimales.fecha,
        animalCodigo: animales.codigo,
        animalNombre: animales.nombre,
      })
      .from(serviciosVeterinariosAnimales)
      .leftJoin(animales, eq(serviciosVeterinariosAnimales.animalId, animales.id))
      .where(
        and(
          eq(animales.predioId, predioId),
          eq(serviciosVeterinariosAnimales.activo, 1),
          eq(animales.activo, 1)
        )
      )

    for (const tratamiento of tratamientos) {
      if (!tratamiento.fecha) continue
      if (!tratamiento.tratamiento) continue

      // Check if it's a vaccination (contains "vacuna" or similar)
      const esVacuna = tratamiento.tratamiento.toLowerCase().includes('vacuna')

      if (esVacuna) {
        // Assuming vaccinations need to be repeated every year
        // Next vaccine due ~365 days after last
        const proximaVacuna = new Date(tratamiento.fecha)
        proximaVacuna.setDate(proximaVacuna.getDate() + 365)

        if (proximaVacuna >= startDate && proximaVacuna <= endDate) {
          const diasRestantes = Math.ceil(
            (proximaVacuna.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          alertas.push({
            tipo: 'VACUNA_PENDIENTE',
            titulo: `Vacuna próxima — ${tratamiento.tratamiento} Animal ${tratamiento.animalCodigo}`,
            mensaje: `El animal ${tratamiento.animalCodigo} tiene una ${tratamiento.tratamiento} pendiente para el ${proximaVacuna.toLocaleDateString()}.`,
            entidadTipo: 'animal',
            entidadId: tratamiento.animalId,
            fechaEvento: proximaVacuna,
            diasAnticipacion: diasRestantes,
          })
        }
      }
    }

    return alertas
  }

  private async evaluarAnimalesEnfermos(
    predioId: number,
    today: Date
  ): Promise<AlertaDetectada[]> {
    const alertas: AlertaDetectada[] = []
    const diasSinAtencionLimite = 3 // Alert if no treatment in 3 days

    // Look for animals with estadoSalud indicating "enfermo" (typically estadoSaludKey = 2)
    // and no veterinary treatment in the last 3 days
    const animalesEnfermos = await this.db
      .select({
        id: animales.id,
        codigo: animales.codigo,
        nombre: animales.nombre,
        saludAnimalKey: animales.saludAnimalKey,
      })
      .from(animales)
      .where(
        and(
          eq(animales.predioId, predioId),
          eq(animales.activo, 1),
          eq(animales.saludAnimalKey, 2) // 2 = Enfermo
        )
      )

    // Batch fetch all treatments for this predio to avoid N+1
    const allTratamientos = await this.db
      .select({
        animalId: serviciosVeterinariosAnimales.animalId,
        fecha: serviciosVeterinariosAnimales.fecha,
      })
      .from(serviciosVeterinariosAnimales)
      .where(
        and(
          eq(serviciosVeterinariosAnimales.predioId, predioId),
          eq(serviciosVeterinariosAnimales.activo, 1)
        )
      )

    // Build a map: animalId -> latest treatment fecha
    const tratamientoMap = new Map<number, Date>()
    for (const tratamiento of allTratamientos) {
      if (tratamiento.fecha) {
        const existing = tratamientoMap.get(tratamiento.animalId)
        if (!existing || tratamiento.fecha > existing) {
          tratamientoMap.set(tratamiento.animalId, tratamiento.fecha)
        }
      }
    }

    for (const animal of animalesEnfermos) {
      // Find the last treatment for this animal using the map
      const ultimoTratamientoFecha = tratamientoMap.get(animal.id)

      if (!ultimoTratamientoFecha) {
        // Animal is sick and never treated
        alertas.push({
          tipo: 'ANIMAL_ENFERMO',
          titulo: `Animal enfermo sin atención — ${animal.codigo}`,
          mensaje: `El animal ${animal.codigo} está marcado como enfermo y no tiene tratamientos registrados.`,
          entidadTipo: 'animal',
          entidadId: animal.id,
          fechaEvento: today,
          diasAnticipacion: 0,
        })
      } else {
        const diasSinAtencion = Math.ceil(
          (today.getTime() - ultimoTratamientoFecha.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (diasSinAtencion >= diasSinAtencionLimite) {
          alertas.push({
            tipo: 'ANIMAL_ENFERMO',
            titulo: `Animal enfermo sin atención — ${animal.codigo}`,
            mensaje: `El animal ${animal.codigo} no ha recibido atención veterinaria en ${diasSinAtencion} días.`,
            entidadTipo: 'animal',
            entidadId: animal.id,
            fechaEvento: today,
            diasAnticipacion: diasSinAtencion,
          })
        }
      }
    }

    return alertas
  }

  private async existeNotificacionSimilar(
    predioId: number,
    tipo: NotificacionTipo,
    entidadId: number
  ): Promise<boolean> {
    // Check for existing notification of same type for same entity (regardless of date)
    const [existing] = await this.db
      .select({ id: notificaciones.id })
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.predioId, predioId),
          eq(notificaciones.tipo, tipo),
          eq(notificaciones.entidadId, entidadId),
          eq(notificaciones.activo, 1)
        )
      )
      .limit(1)

    return !!existing
  }

  private async crearNotificacion(predioId: number, alerta: AlertaDetectada): Promise<void> {
    await this.db.insert(notificaciones).values({
      predioId,
      usuarioId: null, // Will be assigned based on preferences later
      tipo: alerta.tipo,
      titulo: alerta.titulo,
      mensaje: alerta.mensaje,
      entidadTipo: alerta.entidadTipo,
      entidadId: alerta.entidadId,
      leida: 0,
      fechaEvento: alerta.fechaEvento,
      activo: 1,
    })
  }
}

export const ALERTA_SCHEDULER_SERVICE = Symbol('AlertaSchedulerService')
