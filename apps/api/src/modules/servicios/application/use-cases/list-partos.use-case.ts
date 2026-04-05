import { inject, injectable } from 'tsyringe'
import { PARTO_ANIMAL_REPOSITORY } from '../../domain/repositories/parto-animal.repository.js'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import type { PartoAnimalResponseDto } from '../dtos/parto.dto.js'
import { PartoAnimalMapper } from '../../infrastructure/mappers/parto.mapper.js'

@injectable()
export class ListPartosUseCase {
  constructor(
    @inject(PARTO_ANIMAL_REPOSITORY) private readonly repo: IPartoAnimalRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: PartoAnimalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map((p) => ({ ...PartoAnimalMapper.toResponse(p), crias: [] })),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
