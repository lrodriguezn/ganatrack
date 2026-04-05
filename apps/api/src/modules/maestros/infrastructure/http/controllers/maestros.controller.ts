import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable } from 'tsyringe'

// Tenant-scoped use cases
import { CrearVeterinarioUseCase } from '../../../application/use-cases/crear-veterinario.use-case.js'
import { GetVeterinarioUseCase } from '../../../application/use-cases/get-veterinario.use-case.js'
import { ListVeterinariosUseCase } from '../../../application/use-cases/list-veterinarios.use-case.js'
import { UpdateVeterinarioUseCase } from '../../../application/use-cases/update-veterinario.use-case.js'
import { DeleteVeterinarioUseCase } from '../../../application/use-cases/delete-veterinario.use-case.js'
import { CrearPropietarioUseCase } from '../../../application/use-cases/crear-propietario.use-case.js'
import { GetPropietarioUseCase } from '../../../application/use-cases/get-propietario.use-case.js'
import { ListPropietariosUseCase } from '../../../application/use-cases/list-propietarios.use-case.js'
import { UpdatePropietarioUseCase } from '../../../application/use-cases/update-propietario.use-case.js'
import { DeletePropietarioUseCase } from '../../../application/use-cases/delete-propietario.use-case.js'
import { CrearHierroUseCase } from '../../../application/use-cases/crear-hierro.use-case.js'
import { GetHierroUseCase } from '../../../application/use-cases/get-hierro.use-case.js'
import { ListHierrosUseCase } from '../../../application/use-cases/list-hierros.use-case.js'
import { UpdateHierroUseCase } from '../../../application/use-cases/update-hierro.use-case.js'
import { DeleteHierroUseCase } from '../../../application/use-cases/delete-hierro.use-case.js'

// Global use cases
import { CrearDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/crear-diagnostico-veterinario.use-case.js'
import { GetDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/get-diagnostico-veterinario.use-case.js'
import { ListDiagnosticosVeterinariosUseCase } from '../../../application/use-cases/list-diagnosticos-veterinarios.use-case.js'
import { UpdateDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/update-diagnostico-veterinario.use-case.js'
import { DeleteDiagnosticoVeterinarioUseCase } from '../../../application/use-cases/delete-diagnostico-veterinario.use-case.js'
import { CrearMotivoVentaUseCase } from '../../../application/use-cases/crear-motivo-venta.use-case.js'
import { GetMotivoVentaUseCase } from '../../../application/use-cases/get-motivo-venta.use-case.js'
import { ListMotivosVentasUseCase } from '../../../application/use-cases/list-motivos-ventas.use-case.js'
import { UpdateMotivoVentaUseCase } from '../../../application/use-cases/update-motivo-venta.use-case.js'
import { DeleteMotivoVentaUseCase } from '../../../application/use-cases/delete-motivo-venta.use-case.js'
import { CrearCausaMuerteUseCase } from '../../../application/use-cases/crear-causa-muerte.use-case.js'
import { GetCausaMuerteUseCase } from '../../../application/use-cases/get-causa-muerte.use-case.js'
import { ListCausasMuerteUseCase } from '../../../application/use-cases/list-causas-muerte.use-case.js'
import { UpdateCausaMuerteUseCase } from '../../../application/use-cases/update-causa-muerte.use-case.js'
import { DeleteCausaMuerteUseCase } from '../../../application/use-cases/delete-causa-muerte.use-case.js'
import { CrearLugarCompraUseCase } from '../../../application/use-cases/crear-lugar-compra.use-case.js'
import { GetLugarCompraUseCase } from '../../../application/use-cases/get-lugar-compra.use-case.js'
import { ListLugaresComprasUseCase } from '../../../application/use-cases/list-lugares-compras.use-case.js'
import { UpdateLugarCompraUseCase } from '../../../application/use-cases/update-lugar-compra.use-case.js'
import { DeleteLugarCompraUseCase } from '../../../application/use-cases/delete-lugar-compra.use-case.js'
import { CrearLugarVentaUseCase } from '../../../application/use-cases/crear-lugar-venta.use-case.js'
import { GetLugarVentaUseCase } from '../../../application/use-cases/get-lugar-venta.use-case.js'
import { ListLugaresVentasUseCase } from '../../../application/use-cases/list-lugares-ventas.use-case.js'
import { UpdateLugarVentaUseCase } from '../../../application/use-cases/update-lugar-venta.use-case.js'
import { DeleteLugarVentaUseCase } from '../../../application/use-cases/delete-lugar-venta.use-case.js'

import type { CreateVeterinarioDto, UpdateVeterinarioDto, CreatePropietarioDto, UpdatePropietarioDto, CreateHierroDto, UpdateHierroDto, CreateDiagnosticoVeterinarioDto, UpdateDiagnosticoVeterinarioDto, CreateMotivoVentaDto, UpdateMotivoVentaDto, CreateCausaMuerteDto, UpdateCausaMuerteDto, CreateLugarCompraDto, UpdateLugarCompraDto, CreateLugarVentaDto, UpdateLugarVentaDto } from '../../../application/dtos/maestros.dto.js'

@injectable()
export class MaestrosController {
  constructor(
    // Veterinario
    private readonly crearVeterinarioUseCase: CrearVeterinarioUseCase,
    private readonly getVeterinarioUseCase: GetVeterinarioUseCase,
    private readonly listVeterinariosUseCase: ListVeterinariosUseCase,
    private readonly updateVeterinarioUseCase: UpdateVeterinarioUseCase,
    private readonly deleteVeterinarioUseCase: DeleteVeterinarioUseCase,
    // Propietario
    private readonly crearPropietarioUseCase: CrearPropietarioUseCase,
    private readonly getPropietarioUseCase: GetPropietarioUseCase,
    private readonly listPropietariosUseCase: ListPropietariosUseCase,
    private readonly updatePropietarioUseCase: UpdatePropietarioUseCase,
    private readonly deletePropietarioUseCase: DeletePropietarioUseCase,
    // Hierro
    private readonly crearHierroUseCase: CrearHierroUseCase,
    private readonly getHierroUseCase: GetHierroUseCase,
    private readonly listHierrosUseCase: ListHierrosUseCase,
    private readonly updateHierroUseCase: UpdateHierroUseCase,
    private readonly deleteHierroUseCase: DeleteHierroUseCase,
    // DiagnosticoVeterinario
    private readonly crearDiagnosticoVeterinarioUseCase: CrearDiagnosticoVeterinarioUseCase,
    private readonly getDiagnosticoVeterinarioUseCase: GetDiagnosticoVeterinarioUseCase,
    private readonly listDiagnosticosVeterinariosUseCase: ListDiagnosticosVeterinariosUseCase,
    private readonly updateDiagnosticoVeterinarioUseCase: UpdateDiagnosticoVeterinarioUseCase,
    private readonly deleteDiagnosticoVeterinarioUseCase: DeleteDiagnosticoVeterinarioUseCase,
    // MotivoVenta
    private readonly crearMotivoVentaUseCase: CrearMotivoVentaUseCase,
    private readonly getMotivoVentaUseCase: GetMotivoVentaUseCase,
    private readonly listMotivosVentasUseCase: ListMotivosVentasUseCase,
    private readonly updateMotivoVentaUseCase: UpdateMotivoVentaUseCase,
    private readonly deleteMotivoVentaUseCase: DeleteMotivoVentaUseCase,
    // CausaMuerte
    private readonly crearCausaMuerteUseCase: CrearCausaMuerteUseCase,
    private readonly getCausaMuerteUseCase: GetCausaMuerteUseCase,
    private readonly listCausasMuerteUseCase: ListCausasMuerteUseCase,
    private readonly updateCausaMuerteUseCase: UpdateCausaMuerteUseCase,
    private readonly deleteCausaMuerteUseCase: DeleteCausaMuerteUseCase,
    // LugarCompra
    private readonly crearLugarCompraUseCase: CrearLugarCompraUseCase,
    private readonly getLugarCompraUseCase: GetLugarCompraUseCase,
    private readonly listLugaresComprasUseCase: ListLugaresComprasUseCase,
    private readonly updateLugarCompraUseCase: UpdateLugarCompraUseCase,
    private readonly deleteLugarCompraUseCase: DeleteLugarCompraUseCase,
    // LugarVenta
    private readonly crearLugarVentaUseCase: CrearLugarVentaUseCase,
    private readonly getLugarVentaUseCase: GetLugarVentaUseCase,
    private readonly listLugaresVentasUseCase: ListLugaresVentasUseCase,
    private readonly updateLugarVentaUseCase: UpdateLugarVentaUseCase,
    private readonly deleteLugarVentaUseCase: DeleteLugarVentaUseCase,
  ) {}

  // ============ VETERINARIOS (tenant-scoped) ============
  async listVeterinarios(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20, search } = request.query as any
    const result = await this.listVeterinariosUseCase.execute(predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getVeterinarioUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearVeterinarioUseCase.execute(request.body as CreateVeterinarioDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateVeterinarioUseCase.execute(id, request.body as UpdateVeterinarioDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteVeterinario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteVeterinarioUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Veterinario eliminado' } })
  }

  // ============ PROPIETARIOS (tenant-scoped) ============
  async listPropietarios(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20, search } = request.query as any
    const result = await this.listPropietariosUseCase.execute(predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getPropietario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getPropietarioUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearPropietario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearPropietarioUseCase.execute(request.body as CreatePropietarioDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }
  async updatePropietario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updatePropietarioUseCase.execute(id, request.body as UpdatePropietarioDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async deletePropietario(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deletePropietarioUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Propietario eliminado' } })
  }

  // ============ HIERROS (tenant-scoped) ============
  async listHierros(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20, search } = request.query as any
    const result = await this.listHierrosUseCase.execute(predioId, { page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getHierro(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getHierroUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearHierro(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearHierroUseCase.execute(request.body as CreateHierroDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateHierro(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateHierroUseCase.execute(id, request.body as UpdateHierroDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteHierro(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteHierroUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Hierro eliminado' } })
  }

  // ============ DIAGNOSTICOS VETERINARIOS (global) ============
  async listDiagnosticosVeterinarios(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listDiagnosticosVeterinariosUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getDiagnosticoVeterinario(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getDiagnosticoVeterinarioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearDiagnosticoVeterinario(request: FastifyRequest<{ Body: CreateDiagnosticoVeterinarioDto }>, reply: FastifyReply) {
    const result = await this.crearDiagnosticoVeterinarioUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateDiagnosticoVeterinario(request: FastifyRequest<{ Params: { id: number }; Body: UpdateDiagnosticoVeterinarioDto }>, reply: FastifyReply) {
    const result = await this.updateDiagnosticoVeterinarioUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteDiagnosticoVeterinario(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteDiagnosticoVeterinarioUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Diagnóstico eliminado' } })
  }

  // ============ MOTIVOS VENTAS (global) ============
  async listMotivosVentas(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listMotivosVentasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getMotivoVenta(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getMotivoVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearMotivoVenta(request: FastifyRequest<{ Body: CreateMotivoVentaDto }>, reply: FastifyReply) {
    const result = await this.crearMotivoVentaUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateMotivoVenta(request: FastifyRequest<{ Params: { id: number }; Body: UpdateMotivoVentaDto }>, reply: FastifyReply) {
    const result = await this.updateMotivoVentaUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteMotivoVenta(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteMotivoVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Motivo de venta eliminado' } })
  }

  // ============ CAUSAS MUERTE (global) ============
  async listCausasMuerte(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listCausasMuerteUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getCausaMuerte(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getCausaMuerteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearCausaMuerte(request: FastifyRequest<{ Body: CreateCausaMuerteDto }>, reply: FastifyReply) {
    const result = await this.crearCausaMuerteUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateCausaMuerte(request: FastifyRequest<{ Params: { id: number }; Body: UpdateCausaMuerteDto }>, reply: FastifyReply) {
    const result = await this.updateCausaMuerteUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteCausaMuerte(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteCausaMuerteUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Causa de muerte eliminada' } })
  }

  // ============ LUGARES COMPRAS (global) ============
  async listLugaresCompras(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listLugaresComprasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getLugarCompra(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getLugarCompraUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearLugarCompra(request: FastifyRequest<{ Body: CreateLugarCompraDto }>, reply: FastifyReply) {
    const result = await this.crearLugarCompraUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateLugarCompra(request: FastifyRequest<{ Params: { id: number }; Body: UpdateLugarCompraDto }>, reply: FastifyReply) {
    const result = await this.updateLugarCompraUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteLugarCompra(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteLugarCompraUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Lugar de compra eliminado' } })
  }

  // ============ LUGARES VENTAS (global) ============
  async listLugaresVentas(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search } = request.query
    const result = await this.listLugaresVentasUseCase.execute({ page, limit, search })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }
  async getLugarVenta(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const result = await this.getLugarVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  }
  async crearLugarVenta(request: FastifyRequest<{ Body: CreateLugarVentaDto }>, reply: FastifyReply) {
    const result = await this.crearLugarVentaUseCase.execute(request.body)
    return reply.code(201).send({ success: true, data: result })
  }
  async updateLugarVenta(request: FastifyRequest<{ Params: { id: number }; Body: UpdateLugarVentaDto }>, reply: FastifyReply) {
    const result = await this.updateLugarVentaUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  }
  async deleteLugarVenta(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    await this.deleteLugarVentaUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Lugar de venta eliminado' } })
  }
}
