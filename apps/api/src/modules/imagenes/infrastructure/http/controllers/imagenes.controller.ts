import type { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'tsyringe'
import type { ListImagenesUseCase } from '../../application/use-cases/list-imagenes.use-case.js'
import type { GetImagenUseCase } from '../../application/use-cases/get-imagen.use-case.js'
import type { UploadImagenUseCase } from '../../application/use-cases/upload-imagen.use-case.js'
import type { DeleteImagenUseCase } from '../../application/use-cases/delete-imagen.use-case.js'
import type { UploadImagenDto } from '../../application/dtos/imagen.dto.js'

@injectable()
export class ImagenesController {
  constructor(
    private readonly listImagenesUseCase: ListImagenesUseCase,
    private readonly getImagenUseCase: GetImagenUseCase,
    private readonly uploadImagenUseCase: UploadImagenUseCase,
    private readonly deleteImagenUseCase: DeleteImagenUseCase,
  ) {}

  async listImagenes(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20 } = request.query as any
    const result = await this.listImagenesUseCase.execute(predioId, { page, limit })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getImagenUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async uploadImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.uploadImagenUseCase.execute(request.body as UploadImagenDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async deleteImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteImagenUseCase.execute(id, predioId)
    return reply.code(204).send()
  }
}
