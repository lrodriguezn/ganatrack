import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { ListProductosUseCase } from '../../application/use-cases/list-productos.use-case.js'
import { GetProductoUseCase } from '../../application/use-cases/get-producto.use-case.js'
import { CrearProductoUseCase } from '../../application/use-cases/crear-producto.use-case.js'
import { UpdateProductoUseCase } from '../../application/use-cases/update-producto.use-case.js'
import { DeleteProductoUseCase } from '../../application/use-cases/delete-producto.use-case.js'
import type { CreateProductoDto, UpdateProductoDto } from '../../application/dtos/producto.dto.js'

@injectable()
export class ProductosController {
  constructor(
    private readonly listProductosUseCase: ListProductosUseCase,
    private readonly getProductoUseCase: GetProductoUseCase,
    private readonly crearProductoUseCase: CrearProductoUseCase,
    private readonly updateProductoUseCase: UpdateProductoUseCase,
    private readonly deleteProductoUseCase: DeleteProductoUseCase,
  ) {}

  async listProductos(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20, tipo_producto_key } = request.query as any
    const result = await this.listProductosUseCase.execute(predioId, { page, limit, tipoProducto: tipo_producto_key })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getProducto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getProductoUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearProducto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearProductoUseCase.execute(request.body as CreateProductoDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateProducto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateProductoUseCase.execute(id, request.body as UpdateProductoDto, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteProducto(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteProductoUseCase.execute(id, predioId)
    return reply.code(204).send()
  }
}
