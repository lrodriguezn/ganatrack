import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listProductosQuerySchema, createProductoBodySchema, idParamsSchema, updateProductoBodySchema } from '../schemas/productos.schema.js'
import { ListProductosUseCase } from '../../../application/use-cases/list-productos.use-case.js'
import { GetProductoUseCase } from '../../../application/use-cases/get-producto.use-case.js'
import { CrearProductoUseCase } from '../../../application/use-cases/crear-producto.use-case.js'
import { UpdateProductoUseCase } from '../../../application/use-cases/update-producto.use-case.js'
import { DeleteProductoUseCase } from '../../../application/use-cases/delete-producto.use-case.js'
import type { IProductoRepository } from '../../../domain/repositories/producto.repository.js'
import type { IProductoImagenRepository } from '../../../domain/repositories/producto-imagen.repository.js'

type ProductosRepos = {
  productoRepo: IProductoRepository
  productoImagenRepo: IProductoImagenRepository
}

type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerProductosRoutes(app: FastifyInstance, repos: ProductosRepos): Promise<void> {
  const { productoRepo } = repos
  const listProductosUseCase = new ListProductosUseCase(productoRepo)
  const getProductoUseCase = new GetProductoUseCase(productoRepo)
  const crearProductoUseCase = new CrearProductoUseCase(productoRepo)
  const updateProductoUseCase = new UpdateProductoUseCase(productoRepo)
  const deleteProductoUseCase = new DeleteProductoUseCase(productoRepo)

  app.get<ListQuery>('/productos', {
    schema: { querystring: listProductosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listProductosUseCase.execute(0, { page, limit, search })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/productos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getProductoUseCase.execute(request.params.id, 0)
    return reply.code(200).send({ success: true, data: result })
  })

  app.post('/productos', {
    schema: { body: createProductoBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await crearProductoUseCase.execute(request.body as any)
    return reply.code(201).send({ success: true, data: result })
  })

  app.put<{ Params: { id: number }; Body: any }>('/productos/:id', {
    schema: { params: idParamsSchema, body: updateProductoBodySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await updateProductoUseCase.execute(request.params.id, request.body)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/productos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteProductoUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Producto eliminado' } })
  })
}
