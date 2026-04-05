import { injectable, inject } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { ImagenResponseDto } from '../dtos/animal.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateImagenUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(id: number, predioId: number, dto: { descripcion?: string; ruta?: string }): Promise<ImagenResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Imagen', id)
    }

    const updateData: Record<string, unknown> = {}
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
    if (dto.ruta !== undefined) updateData.ruta = dto.ruta

    const entity = await this.repo.update(id, updateData)
    if (!entity) {
      throw new NotFoundError('Imagen', id)
    }
    return ImagenMapper.toResponse(entity)
  }
}
