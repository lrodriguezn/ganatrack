import type { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'tsyringe'
import type { CrearPredioUseCase } from '../../../application/use-cases/crear-predio.use-case.js'
import type { GetPredioUseCase } from '../../../application/use-cases/get-predio.use-case.js'
import type { ListPrediosUseCase } from '../../../application/use-cases/list-predios.use-case.js'
import type { UpdatePredioUseCase } from '../../../application/use-cases/update-predio.use-case.js'
import type { DeletePredioUseCase } from '../../../application/use-cases/delete-predio.use-case.js'
import type { CrearPotreroUseCase } from '../../../application/use-cases/crear-potrero.use-case.js'
import type { GetPotreroUseCase } from '../../../application/use-cases/get-potrero.use-case.js'
import type { ListPotrerosUseCase } from '../../../application/use-cases/list-potreros.use-case.js'
import type { UpdatePotreroUseCase } from '../../../application/use-cases/update-potrero.use-case.js'
import type { DeletePotreroUseCase } from '../../../application/use-cases/delete-potrero.use-case.js'
import type { CrearSectorUseCase } from '../../../application/use-cases/crear-sector.use-case.js'
import type { GetSectorUseCase } from '../../../application/use-cases/get-sector.use-case.js'
import type { ListSectoresUseCase } from '../../../application/use-cases/list-sectores.use-case.js'
import type { UpdateSectorUseCase } from '../../../application/use-cases/update-sector.use-case.js'
import type { DeleteSectorUseCase } from '../../../application/use-cases/delete-sector.use-case.js'
import type { CrearLoteUseCase } from '../../../application/use-cases/crear-lote.use-case.js'
import type { GetLoteUseCase } from '../../../application/use-cases/get-lote.use-case.js'
import type { ListLotesUseCase } from '../../../application/use-cases/list-lotes.use-case.js'
import type { UpdateLoteUseCase } from '../../../application/use-cases/update-lote.use-case.js'
import type { DeleteLoteUseCase } from '../../../application/use-cases/delete-lote.use-case.js'
import type { CrearGrupoUseCase } from '../../../application/use-cases/crear-grupo.use-case.js'
import type { GetGrupoUseCase } from '../../../application/use-cases/get-grupo.use-case.js'
import type { ListGruposUseCase } from '../../../application/use-cases/list-grupos.use-case.js'
import type { UpdateGrupoUseCase } from '../../../application/use-cases/update-grupo.use-case.js'
import type { DeleteGrupoUseCase } from '../../../application/use-cases/delete-grupo.use-case.js'
import type { CrearConfigParametroPredioUseCase } from '../../../application/use-cases/crear-config-parametro-predio.use-case.js'
import type { GetConfigParametroPredioUseCase } from '../../../application/use-cases/get-config-parametro-predio.use-case.js'
import type { ListConfigParametrosPredioUseCase } from '../../../application/use-cases/list-config-parametros-predio.use-case.js'
import type { UpdateConfigParametroPredioUseCase } from '../../../application/use-cases/update-config-parametro-predio.use-case.js'
import type { DeleteConfigParametroPredioUseCase } from '../../../application/use-cases/delete-config-parametro-predio.use-case.js'
import type {
  CreateConfigParametroPredioDto, CreateGrupoDto,
  CreateLoteDto, CreatePotreroDto,
  CreatePredioDto, CreateSectorDto,
  UpdateConfigParametroPredioDto, UpdateGrupoDto,
  UpdateLoteDto, UpdatePotreroDto,
  UpdatePredioDto, UpdateSectorDto,
} from '../../../application/dtos/predios.dto.js'

@injectable()
export class PrediosController {
  constructor(
    // Predio
    private readonly crearPredioUseCase: CrearPredioUseCase,
    private readonly getPredioUseCase: GetPredioUseCase,
    private readonly listPrediosUseCase: ListPrediosUseCase,
    private readonly updatePredioUseCase: UpdatePredioUseCase,
    private readonly deletePredioUseCase: DeletePredioUseCase,
    // Potrero
    private readonly crearPotreroUseCase: CrearPotreroUseCase,
    private readonly getPotreroUseCase: GetPotreroUseCase,
    private readonly listPotrerosUseCase: ListPotrerosUseCase,
    private readonly updatePotreroUseCase: UpdatePotreroUseCase,
    private readonly deletePotreroUseCase: DeletePotreroUseCase,
    // Sector
    private readonly crearSectorUseCase: CrearSectorUseCase,
    private readonly getSectorUseCase: GetSectorUseCase,
    private readonly listSectoresUseCase: ListSectoresUseCase,
    private readonly updateSectorUseCase: UpdateSectorUseCase,
    private readonly deleteSectorUseCase: DeleteSectorUseCase,
    // Lote
    private readonly crearLoteUseCase: CrearLoteUseCase,
    private readonly getLoteUseCase: GetLoteUseCase,
    private readonly listLotesUseCase: ListLotesUseCase,
    private readonly updateLoteUseCase: UpdateLoteUseCase,
    private readonly deleteLoteUseCase: DeleteLoteUseCase,
    // Grupo
    private readonly crearGrupoUseCase: CrearGrupoUseCase,
    private readonly getGrupoUseCase: GetGrupoUseCase,
    private readonly listGruposUseCase: ListGruposUseCase,
    private readonly updateGrupoUseCase: UpdateGrupoUseCase,
    private readonly deleteGrupoUseCase: DeleteGrupoUseCase,
    // ConfigParametroPredio
    private readonly crearConfigParametroPredioUseCase: CrearConfigParametroPredioUseCase,
    private readonly getConfigParametroPredioUseCase: GetConfigParametroPredioUseCase,
    private readonly listConfigParametrosPredioUseCase: ListConfigParametrosPredioUseCase,
    private readonly updateConfigParametroPredioUseCase: UpdateConfigParametroPredioUseCase,
    private readonly deleteConfigParametroPredioUseCase: DeleteConfigParametroPredioUseCase,
  ) {}

  // ============ PREDIOS ============
  async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listPrediosUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getById(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getPredioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crear(request: FastifyRequest<{ Body: CreatePredioDto }>, reply: FastifyReply) {
    const result = await this.crearPredioUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async update(request: FastifyRequest<{ Params: { id: number }; Body: UpdatePredioDto }>, reply: FastifyReply) {
    const result = await this.updatePredioUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async delete(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deletePredioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Predio eliminado' } })
  }

  // ============ POTREROS ============
  async listPotreros(request: FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listPotrerosUseCase.execute(request.params.predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getPotrero(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    const result = await this.getPotreroUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearPotrero(request: FastifyRequest<{ Params: { predioId: number }; Body: CreatePotreroDto }>, reply: FastifyReply) {
    const result = await this.crearPotreroUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updatePotrero(request: FastifyRequest<{ Params: { predioId: number; id: number }; Body: UpdatePotreroDto }>, reply: FastifyReply) {
    const result = await this.updatePotreroUseCase.execute(request.params.id, request.body, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deletePotrero(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    await this.deletePotreroUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: { message: 'Potrero eliminado' } })
  }

  // ============ SECTORES ============
  async listSectores(request: FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listSectoresUseCase.execute(request.params.predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getSector(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    const result = await this.getSectorUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearSector(request: FastifyRequest<{ Params: { predioId: number }; Body: CreateSectorDto }>, reply: FastifyReply) {
    const result = await this.crearSectorUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateSector(request: FastifyRequest<{ Params: { predioId: number; id: number }; Body: UpdateSectorDto }>, reply: FastifyReply) {
    const result = await this.updateSectorUseCase.execute(request.params.id, request.body, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteSector(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    await this.deleteSectorUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: { message: 'Sector eliminado' } })
  }

  // ============ LOTES ============
  async listLotes(request: FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listLotesUseCase.execute(request.params.predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getLote(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    const result = await this.getLoteUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearLote(request: FastifyRequest<{ Params: { predioId: number }; Body: CreateLoteDto }>, reply: FastifyReply) {
    const result = await this.crearLoteUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateLote(request: FastifyRequest<{ Params: { predioId: number; id: number }; Body: UpdateLoteDto }>, reply: FastifyReply) {
    const result = await this.updateLoteUseCase.execute(request.params.id, request.body, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteLote(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    await this.deleteLoteUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: { message: 'Lote eliminado' } })
  }

  // ============ GRUPOS ============
  async listGrupos(request: FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listGruposUseCase.execute(request.params.predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getGrupo(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    const result = await this.getGrupoUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearGrupo(request: FastifyRequest<{ Params: { predioId: number }; Body: CreateGrupoDto }>, reply: FastifyReply) {
    const result = await this.crearGrupoUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateGrupo(request: FastifyRequest<{ Params: { predioId: number; id: number }; Body: UpdateGrupoDto }>, reply: FastifyReply) {
    const result = await this.updateGrupoUseCase.execute(request.params.id, request.body, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteGrupo(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    await this.deleteGrupoUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: { message: 'Grupo eliminado' } })
  }

  // ============ CONFIG PARAMETROS ============
  async listConfigParametros(request: FastifyRequest<{ Params: { predioId: number }; Querystring: { page?: number; limit?: number } }>, reply: FastifyReply) {
    const { page = 1, limit = 20 } = request.query
    const result = await this.listConfigParametrosPredioUseCase.execute(request.params.predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getConfigParametro(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigParametroPredioUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearConfigParametro(request: FastifyRequest<{ Params: { predioId: number }; Body: CreateConfigParametroPredioDto }>, reply: FastifyReply) {
    const result = await this.crearConfigParametroPredioUseCase.execute(request.body, request.params.predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateConfigParametro(request: FastifyRequest<{ Params: { predioId: number; id: number }; Body: UpdateConfigParametroPredioDto }>, reply: FastifyReply) {
    const result = await this.updateConfigParametroPredioUseCase.execute(request.params.id, request.body, request.params.predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteConfigParametro(request: FastifyRequest<{ Params: { predioId: number; id: number } }>, reply: FastifyReply) {
    await this.deleteConfigParametroPredioUseCase.execute(request.params.id, request.params.predioId)
    return reply.code(200).send({ success: true, data: { message: 'Parámetro eliminado' } })
  }
}
