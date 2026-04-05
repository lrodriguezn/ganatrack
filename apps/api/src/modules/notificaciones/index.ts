import 'reflect-metadata'
import { container } from 'tsyringe'
import type { FastifyInstance } from 'fastify'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'

// Repository interfaces
import { NOTIFICACION_REPOSITORY } from './domain/repositories/notificacion.repository.js'
import type { INotificacionRepository } from './domain/repositories/notificacion.repository.js'
import { PREFERENCIA_REPOSITORY } from './domain/repositories/preferencia.repository.js'
import type { IPreferenciaRepository } from './domain/repositories/preferencia.repository.js'
import { PUSH_TOKEN_REPOSITORY } from './domain/repositories/push-token.repository.js'
import type { IPushTokenRepository } from './domain/repositories/push-token.repository.js'

// Repository implementations
import { DrizzleNotificacionRepository } from './infrastructure/persistence/drizzle-notificacion.repository.js'
import { DrizzlePreferenciaRepository } from './infrastructure/persistence/drizzle-preferencia.repository.js'
import { DrizzlePushTokenRepository } from './infrastructure/persistence/drizzle-push-token.repository.js'

// Domain services
import { ALERT_ENGINE_SERVICE, AlertEngineService } from './domain/services/alert-engine.service.js'
import { ALERTA_SCHEDULER_SERVICE, AlertaSchedulerService } from './infrastructure/scheduler/alerta-scheduler.service.js'

// Channel adapters
import { InAppChannelAdapter } from './infrastructure/channels/in-app.adapter.js'
import { EmailChannelAdapter } from './infrastructure/channels/email.adapter.js'
import { PushChannelAdapter } from './infrastructure/channels/push.adapter.js'

// Use cases
import { ListarNotificacionesUseCase } from './application/use-cases/listar-notificaciones.use-case.js'
import { ObtenerResumenUseCase } from './application/use-cases/obtener-resumen.use-case.js'
import { MarcarLeidaUseCase } from './application/use-cases/marcar-leida.use-case.js'
import { MarcarTodasLeidasUseCase } from './application/use-cases/marcar-todas-leidas.use-case.js'
import { EliminarNotificacionUseCase } from './application/use-cases/eliminar-notificacion.use-case.js'
import { ObtenerPreferenciasUseCase } from './application/use-cases/obtener-preferencias.use-case.js'
import { ActualizarPreferenciaUseCase } from './application/use-cases/actualizar-preferencia.use-case.js'
import { RegistrarPushTokenUseCase } from './application/use-cases/registrar-push-token.use-case.js'
import { EliminarPushTokenUseCase } from './application/use-cases/eliminar-push-token.use-case.js'
import { EvaluarAlertasUseCase } from './application/use-cases/evaluar-alertas.use-case.js'

// Routes
import { registerNotificacionesRoutes } from './infrastructure/http/routes/notificaciones.routes.js'

// DI tokens
const NOTIFICACIONES_DB_CLIENT = Symbol('NotificacionesDbClient')

// Export tokens
export {
  NOTIFICACION_REPOSITORY,
  PREFERENCIA_REPOSITORY,
  PUSH_TOKEN_REPOSITORY,
  ALERT_ENGINE_SERVICE,
  ALERTA_SCHEDULER_SERVICE,
  NOTIFICACIONES_DB_CLIENT,
}

export function registerNotificacionesModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(NOTIFICACIONES_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton<INotificacionRepository>(
    NOTIFICACION_REPOSITORY,
    DrizzleNotificacionRepository
  )
  container.registerSingleton<IPreferenciaRepository>(
    PREFERENCIA_REPOSITORY,
    DrizzlePreferenciaRepository
  )
  container.registerSingleton<IPushTokenRepository>(
    PUSH_TOKEN_REPOSITORY,
    DrizzlePushTokenRepository
  )

  // Register domain services
  container.registerSingleton<AlertEngineService>(ALERT_ENGINE_SERVICE, AlertEngineService)

  // Register scheduler service with explicit DbClient injection
  container.registerSingleton<AlertaSchedulerService>(
    ALERTA_SCHEDULER_SERVICE,
    {
      useFactory: () => new AlertaSchedulerService(db),
    }
  )

  // Register channel adapters
  container.registerSingleton(InAppChannelAdapter)
  container.registerSingleton(EmailChannelAdapter)
  container.registerSingleton(PushChannelAdapter)

  // Register use cases
  container.registerSingleton(ListarNotificacionesUseCase)
  container.registerSingleton(ObtenerResumenUseCase)
  container.registerSingleton(MarcarLeidaUseCase)
  container.registerSingleton(MarcarTodasLeidasUseCase)
  container.registerSingleton(EliminarNotificacionUseCase)
  container.registerSingleton(ObtenerPreferenciasUseCase)
  container.registerSingleton(ActualizarPreferenciaUseCase)
  container.registerSingleton(RegistrarPushTokenUseCase)
  container.registerSingleton(EliminarPushTokenUseCase)
  container.registerSingleton(EvaluarAlertasUseCase)
}

export async function registerNotificacionesModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerNotificacionesRoutes(app)
}
