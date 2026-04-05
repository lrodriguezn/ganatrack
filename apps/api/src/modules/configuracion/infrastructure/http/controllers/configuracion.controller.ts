import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { CrearConfigRazaUseCase } from '../../../application/use-cases/crear-config-raza.use-case.js'
import { GetConfigRazaUseCase } from '../../../application/use-cases/get-config-raza.use-case.js'
import { ListConfigRazasUseCase } from '../../../application/use-cases/list-config-razas.use-case.js'
import { UpdateConfigRazaUseCase } from '../../../application/use-cases/update-config-raza.use-case.js'
import { DeleteConfigRazaUseCase } from '../../../application/use-cases/delete-config-raza.use-case.js'
import { CrearConfigCondicionCorporalUseCase } from '../../../application/use-cases/crear-config-condicion-corporal.use-case.js'
import { GetConfigCondicionCorporalUseCase } from '../../../application/use-cases/get-config-condicion-corporal.use-case.js'
import { ListConfigCondicionesCorporalesUseCase } from '../../../application/use-cases/list-config-condiciones-corporales.use-case.js'
import { UpdateConfigCondicionCorporalUseCase } from '../../../application/use-cases/update-config-condicion-corporal.use-case.js'
import { DeleteConfigCondicionCorporalUseCase } from '../../../application/use-cases/delete-config-condicion-corporal.use-case.js'
import { CrearConfigTipoExplotacionUseCase } from '../../../application/use-cases/crear-config-tipo-explotacion.use-case.js'
import { GetConfigTipoExplotacionUseCase } from '../../../application/use-cases/get-config-tipo-explotacion.use-case.js'
import { ListConfigTiposExplotacionUseCase } from '../../../application/use-cases/list-config-tipos-explotacion.use-case.js'
import { UpdateConfigTipoExplotacionUseCase } from '../../../application/use-cases/update-config-tipo-explotacion.use-case.js'
import { DeleteConfigTipoExplotacionUseCase } from '../../../application/use-cases/delete-config-tipo-explotacion.use-case.js'
import { CrearConfigCalidadAnimalUseCase } from '../../../application/use-cases/crear-config-calidad-animal.use-case.js'
import { GetConfigCalidadAnimalUseCase } from '../../../application/use-cases/get-config-calidad-animal.use-case.js'
import { ListConfigCalidadesAnimalesUseCase } from '../../../application/use-cases/list-config-calidades-animales.use-case.js'
import { UpdateConfigCalidadAnimalUseCase } from '../../../application/use-cases/update-config-calidad-animal.use-case.js'
import { DeleteConfigCalidadAnimalUseCase } from '../../../application/use-cases/delete-config-calidad-animal.use-case.js'
import { CrearConfigColorUseCase } from '../../../application/use-cases/crear-config-color.use-case.js'
import { GetConfigColorUseCase } from '../../../application/use-cases/get-config-color.use-case.js'
import { ListConfigColoresUseCase } from '../../../application/use-cases/list-config-colores.use-case.js'
import { UpdateConfigColorUseCase } from '../../../application/use-cases/update-config-color.use-case.js'
import { DeleteConfigColorUseCase } from '../../../application/use-cases/delete-config-color.use-case.js'
import { CrearConfigRangoEdadUseCase } from '../../../application/use-cases/crear-config-rango-edad.use-case.js'
import { GetConfigRangoEdadUseCase } from '../../../application/use-cases/get-config-rango-edad.use-case.js'
import { ListConfigRangosEdadesUseCase } from '../../../application/use-cases/list-config-rangos-edades.use-case.js'
import { UpdateConfigRangoEdadUseCase } from '../../../application/use-cases/update-config-rango-edad.use-case.js'
import { DeleteConfigRangoEdadUseCase } from '../../../application/use-cases/delete-config-rango-edad.use-case.js'
import { CrearConfigKeyValueUseCase } from '../../../application/use-cases/crear-config-key-value.use-case.js'
import { GetConfigKeyValueUseCase } from '../../../application/use-cases/get-config-key-value.use-case.js'
import { ListConfigKeyValuesUseCase } from '../../../application/use-cases/list-config-key-values.use-case.js'
import { UpdateConfigKeyValueUseCase } from '../../../application/use-cases/update-config-key-value.use-case.js'
import { DeleteConfigKeyValueUseCase } from '../../../application/use-cases/delete-config-key-value.use-case.js'
import type {
  CreateConfigRazaDto,
  UpdateConfigRazaDto,
  CreateConfigCondicionCorporalDto,
  UpdateConfigCondicionCorporalDto,
  CreateConfigTipoExplotacionDto,
  UpdateConfigTipoExplotacionDto,
  CreateConfigCalidadAnimalDto,
  UpdateConfigCalidadAnimalDto,
  CreateConfigColorDto,
  UpdateConfigColorDto,
  CreateConfigRangoEdadDto,
  UpdateConfigRangoEdadDto,
  CreateConfigKeyValueDto,
  UpdateConfigKeyValueDto,
} from '../../../application/dtos/configuracion.dto.js'

@injectable()
export class ConfiguracionController {
  constructor(
    // Raza
    private readonly crearConfigRazaUseCase: CrearConfigRazaUseCase,
    private readonly getConfigRazaUseCase: GetConfigRazaUseCase,
    private readonly listConfigRazasUseCase: ListConfigRazasUseCase,
    private readonly updateConfigRazaUseCase: UpdateConfigRazaUseCase,
    private readonly deleteConfigRazaUseCase: DeleteConfigRazaUseCase,
    // Condicion Corporal
    private readonly crearConfigCondicionCorporalUseCase: CrearConfigCondicionCorporalUseCase,
    private readonly getConfigCondicionCorporalUseCase: GetConfigCondicionCorporalUseCase,
    private readonly listConfigCondicionesCorporalesUseCase: ListConfigCondicionesCorporalesUseCase,
    private readonly updateConfigCondicionCorporalUseCase: UpdateConfigCondicionCorporalUseCase,
    private readonly deleteConfigCondicionCorporalUseCase: DeleteConfigCondicionCorporalUseCase,
    // Tipo Explotacion
    private readonly crearConfigTipoExplotacionUseCase: CrearConfigTipoExplotacionUseCase,
    private readonly getConfigTipoExplotacionUseCase: GetConfigTipoExplotacionUseCase,
    private readonly listConfigTiposExplotacionUseCase: ListConfigTiposExplotacionUseCase,
    private readonly updateConfigTipoExplotacionUseCase: UpdateConfigTipoExplotacionUseCase,
    private readonly deleteConfigTipoExplotacionUseCase: DeleteConfigTipoExplotacionUseCase,
    // Calidad Animal
    private readonly crearConfigCalidadAnimalUseCase: CrearConfigCalidadAnimalUseCase,
    private readonly getConfigCalidadAnimalUseCase: GetConfigCalidadAnimalUseCase,
    private readonly listConfigCalidadesAnimalesUseCase: ListConfigCalidadesAnimalesUseCase,
    private readonly updateConfigCalidadAnimalUseCase: UpdateConfigCalidadAnimalUseCase,
    private readonly deleteConfigCalidadAnimalUseCase: DeleteConfigCalidadAnimalUseCase,
    // Color
    private readonly crearConfigColorUseCase: CrearConfigColorUseCase,
    private readonly getConfigColorUseCase: GetConfigColorUseCase,
    private readonly listConfigColoresUseCase: ListConfigColoresUseCase,
    private readonly updateConfigColorUseCase: UpdateConfigColorUseCase,
    private readonly deleteConfigColorUseCase: DeleteConfigColorUseCase,
    // Rango Edad
    private readonly crearConfigRangoEdadUseCase: CrearConfigRangoEdadUseCase,
    private readonly getConfigRangoEdadUseCase: GetConfigRangoEdadUseCase,
    private readonly listConfigRangosEdadesUseCase: ListConfigRangosEdadesUseCase,
    private readonly updateConfigRangoEdadUseCase: UpdateConfigRangoEdadUseCase,
    private readonly deleteConfigRangoEdadUseCase: DeleteConfigRangoEdadUseCase,
    // Key Value
    private readonly crearConfigKeyValueUseCase: CrearConfigKeyValueUseCase,
    private readonly getConfigKeyValueUseCase: GetConfigKeyValueUseCase,
    private readonly listConfigKeyValuesUseCase: ListConfigKeyValuesUseCase,
    private readonly updateConfigKeyValueUseCase: UpdateConfigKeyValueUseCase,
    private readonly deleteConfigKeyValueUseCase: DeleteConfigKeyValueUseCase,
  ) {}

  // ============ RAZA ============
  async listRazas(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigRazasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getRaza(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigRazaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearRaza(request: FastifyRequest<{ Body: CreateConfigRazaDto }>, reply: FastifyReply) {
    const result = await this.crearConfigRazaUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateRaza(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigRazaDto }>, reply: FastifyReply) {
    const result = await this.updateConfigRazaUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteRaza(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigRazaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Raza eliminada' } })
  }

  // ============ CONDICION CORPORAL ============
  async listCondicionesCorporales(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigCondicionesCorporalesUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getCondicionCorporal(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigCondicionCorporalUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearCondicionCorporal(request: FastifyRequest<{ Body: CreateConfigCondicionCorporalDto }>, reply: FastifyReply) {
    const result = await this.crearConfigCondicionCorporalUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateCondicionCorporal(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigCondicionCorporalDto }>, reply: FastifyReply) {
    const result = await this.updateConfigCondicionCorporalUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteCondicionCorporal(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigCondicionCorporalUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Condición corporal eliminada' } })
  }

  // ============ TIPO EXPLOTACION ============
  async listTiposExplotacion(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigTiposExplotacionUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getTipoExplotacion(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigTipoExplotacionUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearTipoExplotacion(request: FastifyRequest<{ Body: CreateConfigTipoExplotacionDto }>, reply: FastifyReply) {
    const result = await this.crearConfigTipoExplotacionUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateTipoExplotacion(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigTipoExplotacionDto }>, reply: FastifyReply) {
    const result = await this.updateConfigTipoExplotacionUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteTipoExplotacion(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigTipoExplotacionUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Tipo de explotación eliminado' } })
  }

  // ============ CALIDAD ANIMAL ============
  async listCalidadesAnimales(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigCalidadesAnimalesUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getCalidadAnimal(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigCalidadAnimalUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearCalidadAnimal(request: FastifyRequest<{ Body: CreateConfigCalidadAnimalDto }>, reply: FastifyReply) {
    const result = await this.crearConfigCalidadAnimalUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateCalidadAnimal(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigCalidadAnimalDto }>, reply: FastifyReply) {
    const result = await this.updateConfigCalidadAnimalUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteCalidadAnimal(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigCalidadAnimalUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Calidad de animal eliminada' } })
  }

  // ============ COLOR ============
  async listColores(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigColoresUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getColor(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigColorUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearColor(request: FastifyRequest<{ Body: CreateConfigColorDto }>, reply: FastifyReply) {
    const result = await this.crearConfigColorUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateColor(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigColorDto }>, reply: FastifyReply) {
    const result = await this.updateConfigColorUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteColor(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigColorUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Color eliminado' } })
  }

  // ============ RANGO EDAD ============
  async listRangosEdades(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listConfigRangosEdadesUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getRangoEdad(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigRangoEdadUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearRangoEdad(request: FastifyRequest<{ Body: CreateConfigRangoEdadDto }>, reply: FastifyReply) {
    const result = await this.crearConfigRangoEdadUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateRangoEdad(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigRangoEdadDto }>, reply: FastifyReply) {
    const result = await this.updateConfigRangoEdadUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteRangoEdad(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigRangoEdadUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Rango de edad eliminado' } })
  }

  // ============ KEY VALUE ============
  async listKeyValues(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; opcion?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, opcion } = request.query
    const result = await this.listConfigKeyValuesUseCase.execute({ page, limit, opcion })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getKeyValue(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getConfigKeyValueUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearKeyValue(request: FastifyRequest<{ Body: CreateConfigKeyValueDto }>, reply: FastifyReply) {
    const result = await this.crearConfigKeyValueUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateKeyValue(request: FastifyRequest<{ Params: { id: number }; Body: UpdateConfigKeyValueDto }>, reply: FastifyReply) {
    const result = await this.updateConfigKeyValueUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteKeyValue(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteConfigKeyValueUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Configuración eliminada' } })
  }
}
