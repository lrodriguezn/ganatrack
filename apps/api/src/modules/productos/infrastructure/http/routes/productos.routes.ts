import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { ProductosController } from '../controllers/productos.controller.js'
import { authMiddleware, requirePermission } from '../../../../../shared/middleware/index.js'
import {
  createProductoBodySchema,
  idParamsSchema,
  listProductosQuerySchema,
  updateProductoBodySchema,
} from '../schemas/productos.schema.js'

export async function registerProductosRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(ProductosController)

  // GET /api/v1/productos
  app.get('/productos', {
    schema: { querystring: listProductosQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.listProductos(request, reply))

  // GET /api/v1/productos/:id
  app.get('/productos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.getProducto(request, reply))

  // POST /api/v1/productos
  app.post('/productos', {
    schema: { body: createProductoBodySchema },
    preHandler: [authMiddleware, requirePermission('productos:write')],
  }, async (request, reply) => controller.crearProducto(request, reply))

  // PUT /api/v1/productos/:id
  app.put('/productos/:id', {
    schema: { params: idParamsSchema, body: updateProductoBodySchema },
    preHandler: [authMiddleware, requirePermission('productos:write')],
  }, async (request, reply) => controller.updateProducto(request, reply))

  // DELETE /api/v1/productos/:id
  app.delete('/productos/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware, requirePermission('productos:write')],
  }, async (request, reply) => controller.deleteProducto(request, reply))
}
