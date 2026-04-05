import { injectable } from 'tsyringe'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { ListarNotificacionesUseCase } from '../../../application/use-cases/listar-notificaciones.use-case.js'
import { ObtenerResumenUseCase } from '../../../application/use-cases/obtener-resumen.use-case.js'
import { MarcarLeidaUseCase } from '../../../application/use-cases/marcar-leida.use-case.js'
import { MarcarTodasLeidasUseCase } from '../../../application/use-cases/marcar-todas-leidas.use-case.js'
import { EliminarNotificacionUseCase } from '../../../application/use-cases/eliminar-notificacion.use-case.js'
import { ObtenerPreferenciasUseCase } from '../../../application/use-cases/obtener-preferencias.use-case.js'
import { ActualizarPreferenciaUseCase } from '../../../application/use-cases/actualizar-preferencia.use-case.js'
import { RegistrarPushTokenUseCase } from '../../../application/use-cases/registrar-push-token.use-case.js'
import { EliminarPushTokenUseCase } from '../../../application/use-cases/eliminar-push-token.use-case.js'
import { EvaluarAlertasUseCase } from '../../../application/use-cases/evaluar-alertas.use-case.js'
import type {
  ListNotificacionesQueryDto,
  ActualizarPreferenciaBodyDto,
  RegistrarPushTokenBodyDto,
  EvaluarAlertasBodyDto,
} from '../../../application/dtos/notificacion.dto.js'
import type { NotificacionTipo } from '../../../domain/entities/notificacion.entity.js'

@injectable()
export class NotificacionesController {
  constructor(
    private readonly listarNotificacionesUseCase: ListarNotificacionesUseCase,
    private readonly obtenerResumenUseCase: ObtenerResumenUseCase,
    private readonly marcarLeidaUseCase: MarcarLeidaUseCase,
    private readonly marcarTodasLeidasUseCase: MarcarTodasLeidasUseCase,
    private readonly eliminarNotificacionUseCase: EliminarNotificacionUseCase,
    private readonly obtenerPreferenciasUseCase: ObtenerPreferenciasUseCase,
    private readonly actualizarPreferenciaUseCase: ActualizarPreferenciaUseCase,
    private readonly registrarPushTokenUseCase: RegistrarPushTokenUseCase,
    private readonly eliminarPushTokenUseCase: EliminarPushTokenUseCase,
    private readonly evaluarAlertasUseCase: EvaluarAlertasUseCase
  ) {}

  // GET /notificaciones
  async listar(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as ListNotificacionesQueryDto
    const predioId = (request as any).predioId ?? 0

    const result = await this.listarNotificacionesUseCase.execute(predioId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      leida: query.leida,
      tipo: query.tipo,
    })

    return reply.code(200).send({
      success: true,
      data: result.data,
      meta: result.meta,
    })
  }

  // GET /notificaciones/resumen
  async resumen(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.obtenerResumenUseCase.execute(request.predioId ?? 0)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  // PATCH /notificaciones/:id/leer
  async marcarLeida(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number }
    const result = await this.marcarLeidaUseCase.execute(id, request.predioId ?? 0)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  // PATCH /notificaciones/leer-todas
  async marcarTodasLeidas(request: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (request as any).currentUser?.id
    const result = await this.marcarTodasLeidasUseCase.execute(
      request.predioId ?? 0,
      usuarioId
    )

    return reply.code(200).send({
      success: true,
      data: { actualizadas: result.actualizadas },
    })
  }

  // DELETE /notificaciones/:id
  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number }
    await this.eliminarNotificacionUseCase.execute(id, request.predioId ?? 0)

    return reply.code(200).send({
      success: true,
      data: { message: 'Notificación eliminada' },
    })
  }

  // GET /notificaciones/preferencias
  async obtenerPreferencias(request: FastifyRequest, reply: FastifyReply) {
    const usuarioId = (request as any).currentUser?.id ?? 0
    const result = await this.obtenerPreferenciasUseCase.execute(usuarioId)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  // PUT /notificaciones/preferencias/:tipo
  async actualizarPreferencia(request: FastifyRequest, reply: FastifyReply) {
    const { tipo } = request.params as { tipo: NotificacionTipo }
    const body = request.body as ActualizarPreferenciaBodyDto
    const usuarioId = (request as any).currentUser?.id ?? 0

    const result = await this.actualizarPreferenciaUseCase.execute(usuarioId, tipo, body)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  // POST /notificaciones/push-tokens
  async registrarPushToken(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RegistrarPushTokenBodyDto
    const usuarioId = (request as any).currentUser?.id ?? 0

    const result = await this.registrarPushTokenUseCase.execute(usuarioId, body)

    return reply.code(201).send({
      success: true,
      data: result,
    })
  }

  // DELETE /notificaciones/push-tokens/:token
  async eliminarPushToken(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string }
    const usuarioId = (request as any).currentUser?.id ?? 0

    await this.eliminarPushTokenUseCase.execute(usuarioId, token)

    return reply.code(200).send({
      success: true,
      data: { message: 'Token eliminado' },
    })
  }

  // POST /notificaciones/alertas/evaluar
  async evaluarAlertas(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as EvaluarAlertasBodyDto
    // Admin endpoint: uses body.predioId directly if provided (for admin evaluation of specific predios)
    // Otherwise falls back to tenant context
    const targetPredioId = body.predioId ?? request.predioId
    const result = await this.evaluarAlertasUseCase.execute(targetPredioId)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }
}
