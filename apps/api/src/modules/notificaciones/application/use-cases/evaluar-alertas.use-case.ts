import { injectable, inject } from 'tsyringe'
import { ALERTA_SCHEDULER_SERVICE } from '../../infrastructure/scheduler/alerta-scheduler.service.js'
import type { AlertaSchedulerService } from '../../infrastructure/scheduler/alerta-scheduler.service.js'
import type { EvaluarAlertasResponseDto } from '../dtos/notificacion.dto.js'

@injectable()
export class EvaluarAlertasUseCase {
  constructor(
    @inject(ALERTA_SCHEDULER_SERVICE) private readonly scheduler: AlertaSchedulerService
  ) {}

  async execute(predioId?: number): Promise<EvaluarAlertasResponseDto> {
    // If specific predioId provided, the scheduler will only evaluate that one
    // Otherwise it evaluates all active predios
    const result = await this.scheduler.ejecutarEvaluacionDiaria(predioId)

    return {
      notificacionesCreadas: result.notificacionesCreadas,
      prediosEvaluados: result.prediosEvaluados,
      tiempoEjecucionMs: result.tiempoMs,
    }
  }
}
