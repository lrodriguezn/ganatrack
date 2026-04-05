import { injectable, inject } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { ImagenResponseDto } from '../dtos/animal.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/animal.mapper.js'

@injectable()
export class ListImagenesUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: ImagenResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(ImagenMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
