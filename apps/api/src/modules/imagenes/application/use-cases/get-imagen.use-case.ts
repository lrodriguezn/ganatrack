import { injectable, inject } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { ImagenResponseDto } from '../dtos/imagen.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/imagen.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetImagenUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<ImagenResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Imagen', id)
    }
    return ImagenMapper.toResponse(entity)
  }
}
