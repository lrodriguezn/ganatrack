import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/index.js'
import { listImagenesQuerySchema, idParamsSchema } from '../schemas/imagenes.schema.js'
import { ListImagenesUseCase } from '../../../application/use-cases/list-imagenes.use-case.js'
import { GetImagenUseCase } from '../../../application/use-cases/get-imagen.use-case.js'
import { DeleteImagenUseCase } from '../../../application/use-cases/delete-imagen.use-case.js'
import type { IImagenRepository } from '../../../domain/repositories/imagen.repository.js'

type ImagenesRepos = { imagenRepo: IImagenRepository }
type ListQuery = { Querystring: { page?: number; limit?: number; search?: string } }
type IdParams = { Params: { id: number } }

export async function registerImagenesRoutes(app: FastifyInstance, repos: ImagenesRepos): Promise<void> {
  const { imagenRepo } = repos
  const listImagenesUseCase = new ListImagenesUseCase(imagenRepo)
  const getImagenUseCase = new GetImagenUseCase(imagenRepo)
  const deleteImagenUseCase = new DeleteImagenUseCase(imagenRepo)

  app.get<ListQuery>('/imagenes', {
    schema: { querystring: listImagenesQuerySchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const { page = 1, limit = 20, search } = request.query
    const result = await listImagenesUseCase.execute(0, { page, limit, search })
    return reply.code(200).send({ success: true, ...result })
  })

  app.get<IdParams>('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const result = await getImagenUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: result })
  })

  app.delete<IdParams>('/imagenes/:id', {
    schema: { params: idParamsSchema },
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    await deleteImagenUseCase.execute(request.params.id)
    return reply.code(200).send({ success: true, data: { message: 'Imagen eliminada' } })
  })
}
