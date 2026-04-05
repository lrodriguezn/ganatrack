import { injectable, inject } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { AnimalResponseDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'

@injectable()
export class ListAnimalesUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; search?: string; potreroId?: number; estado?: number }): Promise<{
    data: AnimalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(AnimalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
