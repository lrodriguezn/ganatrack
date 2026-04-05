import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'

// Palpaciones use cases
import { ListPalpacionesGrupalesUseCase } from '../../application/use-cases/list-palpaciones-grupales.use-case.js'
import { GetPalpacionGrupalUseCase } from '../../application/use-cases/get-palpacion-grupal.use-case.js'
import { CrearPalpacionGrupalUseCase } from '../../application/use-cases/crear-palpacion-grupal.use-case.js'
import { UpdatePalpacionGrupalUseCase } from '../../application/use-cases/update-palpacion-grupal.use-case.js'
import { DeletePalpacionGrupalUseCase } from '../../application/use-cases/delete-palpacion-grupal.use-case.js'
import { AddPalpacionAnimalUseCase } from '../../application/use-cases/add-palpacion-animal.use-case.js'
import { UpdatePalpacionAnimalUseCase } from '../../application/use-cases/update-palpacion-animal.use-case.js'
import { RemovePalpacionAnimalUseCase } from '../../application/use-cases/remove-palpacion-animal.use-case.js'

// Inseminaciones use cases
import { ListInseminacionesGrupalesUseCase } from '../../application/use-cases/list-inseminaciones-grupales.use-case.js'
import { GetInseminacionGrupalUseCase } from '../../application/use-cases/get-inseminacion-grupal.use-case.js'
import { CrearInseminacionGrupalUseCase } from '../../application/use-cases/crear-inseminacion-grupal.use-case.js'
import { UpdateInseminacionGrupalUseCase } from '../../application/use-cases/update-inseminacion-grupal.use-case.js'
import { DeleteInseminacionGrupalUseCase } from '../../application/use-cases/delete-inseminacion-grupal.use-case.js'
import { AddInseminacionAnimalUseCase } from '../../application/use-cases/add-inseminacion-animal.use-case.js'
import { UpdateInseminacionAnimalUseCase } from '../../application/use-cases/update-inseminacion-animal.use-case.js'
import { RemoveInseminacionAnimalUseCase } from '../../application/use-cases/remove-inseminacion-animal.use-case.js'

// Partos use cases
import { ListPartosUseCase } from '../../application/use-cases/list-partos.use-case.js'
import { GetPartoUseCase } from '../../application/use-cases/get-parto.use-case.js'
import { CrearPartoUseCase } from '../../application/use-cases/crear-parto.use-case.js'
import { UpdatePartoUseCase } from '../../application/use-cases/update-parto.use-case.js'
import { DeletePartoUseCase } from '../../application/use-cases/delete-parto.use-case.js'

// Veterinarios use cases
import { ListVeterinariosGrupalesUseCase } from '../../application/use-cases/list-veterinarios-grupales.use-case.js'
import { GetVeterinarioGrupalUseCase } from '../../application/use-cases/get-veterinario-grupal.use-case.js'
import { CrearVeterinarioGrupalUseCase } from '../../application/use-cases/crear-veterinario-grupal.use-case.js'
import { UpdateVeterinarioGrupalUseCase } from '../../application/use-cases/update-veterinario-grupal.use-case.js'
import { DeleteVeterinarioGrupalUseCase } from '../../application/use-cases/delete-veterinario-grupal.use-case.js'
import { AddVeterinarioAnimalUseCase } from '../../application/use-cases/add-veterinario-animal.use-case.js'
import { UpdateVeterinarioAnimalUseCase } from '../../application/use-cases/update-veterinario-animal.use-case.js'
import { RemoveVeterinarioAnimalUseCase } from '../../application/use-cases/remove-veterinario-animal.use-case.js'

// DTOs
import type {
  CreatePalpacionGrupalDto,
  UpdatePalpacionGrupalDto,
  CreatePalpacionAnimalDto,
  UpdatePalpacionAnimalDto,
  CreateInseminacionGrupalDto,
  UpdateInseminacionGrupalDto,
  CreateInseminacionAnimalDto,
  UpdateInseminacionAnimalDto,
  CreatePartoAnimalDto,
  UpdatePartoAnimalDto,
  CreateVeterinarioGrupalDto,
  UpdateVeterinarioGrupalDto,
  CreateVeterinarioAnimalDto,
  UpdateVeterinarioAnimalDto,
} from '../../application/dtos/index.js'

@injectable()
export class ServiciosController {
  constructor(
    // Palpaciones
    private readonly listPalpacionesGrupalesUseCase: ListPalpacionesGrupalesUseCase,
    private readonly getPalpacionGrupalUseCase: GetPalpacionGrupalUseCase,
    private readonly crearPalpacionGrupalUseCase: CrearPalpacionGrupalUseCase,
    private readonly updatePalpacionGrupalUseCase: UpdatePalpacionGrupalUseCase,
    private readonly deletePalpacionGrupalUseCase: DeletePalpacionGrupalUseCase,
    private readonly addPalpacionAnimalUseCase: AddPalpacionAnimalUseCase,
    private readonly updatePalpacionAnimalUseCase: UpdatePalpacionAnimalUseCase,
    private readonly removePalpacionAnimalUseCase: RemovePalpacionAnimalUseCase,
    // Inseminaciones
    private readonly listInseminacionesGrupalesUseCase: ListInseminacionesGrupalesUseCase,
    private readonly getInseminacionGrupalUseCase: GetInseminacionGrupalUseCase,
    private readonly crearInseminacionGrupalUseCase: CrearInseminacionGrupalUseCase,
    private readonly updateInseminacionGrupalUseCase: UpdateInseminacionGrupalUseCase,
    private readonly deleteInseminacionGrupalUseCase: DeleteInseminacionGrupalUseCase,
    private readonly addInseminacionAnimalUseCase: AddInseminacionAnimalUseCase,
    private readonly updateInseminacionAnimalUseCase: UpdateInseminacionAnimalUseCase,
    private readonly removeInseminacionAnimalUseCase: RemoveInseminacionAnimalUseCase,
    // Partos
    private readonly listPartosUseCase: ListPartosUseCase,
    private readonly getPartoUseCase: GetPartoUseCase,
    private readonly crearPartoUseCase: CrearPartoUseCase,
    private readonly updatePartoUseCase: UpdatePartoUseCase,
    private readonly deletePartoUseCase: DeletePartoUseCase,
    // Veterinarios
    private readonly listVeterinariosGrupalesUseCase: ListVeterinariosGrupalesUseCase,
    private readonly getVeterinarioGrupalUseCase: GetVeterinarioGrupalUseCase,
    private readonly crearVeterinarioGrupalUseCase: CrearVeterinarioGrupalUseCase,
    private readonly updateVeterinarioGrupalUseCase: UpdateVeterinarioGrupalUseCase,
    private readonly deleteVeterinarioGrupalUseCase: DeleteVeterinarioGrupalUseCase,
    private readonly addVeterinarioAnimalUseCase: AddVeterinarioAnimalUseCase,
    private readonly updateVeterinarioAnimalUseCase: UpdateVeterinarioAnimalUseCase,
    private readonly removeVeterinarioAnimalUseCase: RemoveVeterinarioAnimalUseCase,
  ) {}

  // ============ PALPACIONES ============
  async listPalpaciones(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20 } = request.query as any
    const result = await this.listPalpacionesGrupalesUseCase.execute(predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getPalpacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getPalpacionGrupalUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearPalpacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearPalpacionGrupalUseCase.execute(request.body as CreatePalpacionGrupalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updatePalpacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updatePalpacionGrupalUseCase.execute(id, request.body as UpdatePalpacionGrupalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deletePalpacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deletePalpacionGrupalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  async addPalpacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { grupalId } = request.params as any
    const result = await this.addPalpacionAnimalUseCase.execute(grupalId, request.body as CreatePalpacionAnimalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updatePalpacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updatePalpacionAnimalUseCase.execute(id, request.body as UpdatePalpacionAnimalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async removePalpacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.removePalpacionAnimalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  // ============ INSEMINACIONES ============
  async listInseminaciones(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20 } = request.query as any
    const result = await this.listInseminacionesGrupalesUseCase.execute(predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getInseminacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getInseminacionGrupalUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearInseminacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearInseminacionGrupalUseCase.execute(request.body as CreateInseminacionGrupalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateInseminacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateInseminacionGrupalUseCase.execute(id, request.body as UpdateInseminacionGrupalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteInseminacion(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteInseminacionGrupalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  async addInseminacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { grupalId } = request.params as any
    const result = await this.addInseminacionAnimalUseCase.execute(grupalId, request.body as CreateInseminacionAnimalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateInseminacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateInseminacionAnimalUseCase.execute(id, request.body as UpdateInseminacionAnimalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async removeInseminacionAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.removeInseminacionAnimalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  // ============ PARTOS ============
  async listPartos(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20 } = request.query as any
    const result = await this.listPartosUseCase.execute(predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getParto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getPartoUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearParto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearPartoUseCase.execute(request.body as CreatePartoAnimalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateParto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updatePartoUseCase.execute(id, request.body as UpdatePartoAnimalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteParto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deletePartoUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  // ============ VETERINARIOS ============
  async listVeterinarios(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20 } = request.query as any
    const result = await this.listVeterinariosGrupalesUseCase.execute(predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getVeterinarioGrupalUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearVeterinarioGrupalUseCase.execute(request.body as CreateVeterinarioGrupalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateVeterinarioGrupalUseCase.execute(id, request.body as UpdateVeterinarioGrupalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteVeterinarioGrupalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }

  async addVeterinarioAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { grupalId } = request.params as any
    const result = await this.addVeterinarioAnimalUseCase.execute(grupalId, request.body as CreateVeterinarioAnimalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateVeterinarioAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateVeterinarioAnimalUseCase.execute(id, request.body as UpdateVeterinarioAnimalDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async removeVeterinarioAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.removeVeterinarioAnimalUseCase.execute(id, predioId)
    return reply.code(204).send()
  }
}
