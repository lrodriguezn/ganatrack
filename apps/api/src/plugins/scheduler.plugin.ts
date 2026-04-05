import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { AlertaSchedulerService } from '../modules/notificaciones/infrastructure/scheduler/alerta-scheduler.service.js'

declare module 'fastify' {
  interface FastifyInstance {
    scheduler: {
      start: () => void
      stop: () => void
      isRunning: () => boolean
    }
  }
}

export async function registerSchedulerPlugin(fastify: FastifyInstance): Promise<void> {
  const scheduler = container.resolve(AlertaSchedulerService)
  let cronJob: NodeJS.Timeout | null = null
  let running = false

  const start = () => {
    if (running) {
      fastify.log.warn('[Scheduler] Already running')
      return
    }

    // Schedule to run daily at 00:30
    fastify.log.info('[Scheduler] Scheduling daily alert evaluation at 30 0 * * *')

    // Simple cron-like execution using setInterval
    // In production, use node-cron package
    const checkAndRun = async () => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 30) {
        fastify.log.info('[Scheduler] Running daily alert evaluation...')
        try {
          const result = await scheduler.ejecutarEvaluacionDiaria()
          fastify.log.info(
            `[Scheduler] Completed: ${result.notificacionesCreadas} notifications created, ` +
            `${result.prediosEvaluados} predios evaluated in ${result.tiempoMs}ms`
          )
        } catch (error) {
          fastify.log.error('[Scheduler] Error during evaluation: ' + String(error))
        }
      }
    }

    // Check every minute
    cronJob = setInterval(checkAndRun, 60000)
    running = true
    fastify.log.info('[Scheduler] Started')
  }

  const stop = () => {
    if (cronJob) {
      clearInterval(cronJob)
      cronJob = null
    }
    running = false
    fastify.log.info('[Scheduler] Stopped')
  }

  const isRunning = () => running

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    stop()
  })

  // Handle SIGTERM/SIGINT
  process.on('SIGTERM', () => {
    fastify.log.info('[Scheduler] Received SIGTERM, shutting down...')
    stop()
  })

  process.on('SIGINT', () => {
    fastify.log.info('[Scheduler] Received SIGINT, shutting down...')
    stop()
  })

  fastify.decorate('scheduler', { start, stop, isRunning })

  // Auto-start if enabled
  if (process.env.NOTIFICATIONS_SCHEDULER_ENABLED !== 'false') {
    start()
  }
}

export default registerSchedulerPlugin
