import type { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'tsyringe'
import { CrearAnimalUseCase } from '../../../application/use-cases/crear-animal.use-case.js'
import { GetAnimalUseCase } from '../../../application/use-cases/get-animal.use-case.js'
import { ListAnimalesUseCase } from '../../../application/use-cases/list-animales.use-case.js'
import { UpdateAnimalUseCase } from '../../../application/use-cases/update-animal.use-case.js'
import { DeleteAnimalUseCase } from '../../../application/use-cases/delete-animal.use-case.js'
import { GetGenealogiaAnimalUseCase } from '../../../application/use-cases/get-genealogia-animal.use-case.js'
import { CrearImagenUseCase } from '../../../application/use-cases/crear-imagen.use-case.js'
import { GetImagenUseCase } from '../../../application/use-cases/get-imagen.use-case.js'
import { ListImagenesUseCase } from '../../../application/use-cases/list-imagenes.use-case.js'
import { UpdateImagenUseCase } from '../../../application/use-cases/update-imagen.use-case.js'
import { DeleteImagenUseCase } from '../../../application/use-cases/delete-imagen.use-case.js'
import { AssignImagenToAnimalUseCase } from '../../../application/use-cases/assign-imagen-to-animal.use-case.js'
import { ListAnimalImagenesUseCase } from '../../../application/use-cases/list-animal-imagenes.use-case.js'
import { ListImagenAnimalesUseCase } from '../../../application/use-cases/list-imagen-animales.use-case.js'
import { RemoveImagenFromAnimalUseCase } from '../../../application/use-cases/remove-imagen-from-animal.use-case.js'
import type {
  CreateAnimalDto,
  UpdateAnimalDto,
  CreateImagenDto,
  AssignImagenDto,
} from '../../../application/dtos/animal.dto.js'

@injectable()
export class AnimalesController {
  constructor(
    // Animal use cases
    private readonly crearAnimalUseCase: CrearAnimalUseCase,
    private readonly getAnimalUseCase: GetAnimalUseCase,
    private readonly listAnimalesUseCase: ListAnimalesUseCase,
    private readonly updateAnimalUseCase: UpdateAnimalUseCase,
    private readonly deleteAnimalUseCase: DeleteAnimalUseCase,
    private readonly getGenealogiaAnimalUseCase: GetGenealogiaAnimalUseCase,
    // Imagen use cases
    private readonly crearImagenUseCase: CrearImagenUseCase,
    private readonly getImagenUseCase: GetImagenUseCase,
    private readonly listImagenesUseCase: ListImagenesUseCase,
    private readonly updateImagenUseCase: UpdateImagenUseCase,
    private readonly deleteImagenUseCase: DeleteImagenUseCase,
    // Animal-Imagen use cases
    private readonly assignImagenToAnimalUseCase: AssignImagenToAnimalUseCase,
    private readonly listAnimalImagenesUseCase: ListAnimalImagenesUseCase,
    private readonly listImagenAnimalesUseCase: ListImagenAnimalesUseCase,
    private readonly removeImagenFromAnimalUseCase: RemoveImagenFromAnimalUseCase,
  ) {}

  // ============ ANIMALES ============
  async listAnimales(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { page = 1, limit = 20, search, potreroId, estado } = request.query as any
    const result = await this.listAnimalesUseCase.execute(predioId, { page, limit, search, potreroId, estado })
    return reply.code(200).send({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total } })
  }

  async getAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.getAnimalUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async crearAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearAnimalUseCase.execute(request.body as CreateAnimalDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateAnimalUseCase.execute(id, predioId, request.body as UpdateAnimalDto)
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteAnimalUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Animal eliminado' } })
  }

  async getGenealogia(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id, maxDepth } = request.params as any
    const result = await this.getGenealogiaAnimalUseCase.execute(id, predioId, maxDepth)
    return reply.code(200).send({ success: true, data: result })
  }

  // ============ IMAGENES ============
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

  async crearImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const result = await this.crearImagenUseCase.execute(request.body as CreateImagenDto, predioId)
    return reply.code(201).send({ success: true, data: result })
  }

  async updateImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.updateImagenUseCase.execute(id, predioId, request.body as { descripcion?: string; ruta?: string })
    return reply.code(200).send({ success: true, data: result })
  }

  async deleteImagen(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    await this.deleteImagenUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Imagen eliminada' } })
  }

  // ============ ANIMAL-IMAGEN JUNCTION ============
  async listAnimalImagenes(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.listAnimalImagenesUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async listImagenAnimales(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.listImagenAnimalesUseCase.execute(id, predioId)
    return reply.code(200).send({ success: true, data: result })
  }

  async assignImagenToAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id } = request.params as any
    const result = await this.assignImagenToAnimalUseCase.execute(id, predioId, request.body as AssignImagenDto)
    return reply.code(201).send({ success: true, data: result })
  }

  async removeImagenFromAnimal(request: FastifyRequest, reply: FastifyReply) {
    const predioId = (request as any).predioId || 0
    const { id, imagenId } = request.params as any
    await this.removeImagenFromAnimalUseCase.execute(id, imagenId, predioId)
    return reply.code(200).send({ success: true, data: { message: 'Imagen desasignada del animal' } })
  }
}
