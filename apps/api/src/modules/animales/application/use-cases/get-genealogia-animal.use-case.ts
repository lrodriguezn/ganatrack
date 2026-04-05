import { injectable, inject } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { GenealogiaResponseDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetGenealogiaAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
  ) {}

  async execute(id: number, predioId: number, maxDepth?: number): Promise<GenealogiaResponseDto> {
    const animal = await this.repo.findById(id, predioId)
    if (!animal) {
      throw new NotFoundError('Animal', id)
    }

    const genealogy = await this.repo.getGenealogy(id, maxDepth)

    return {
      animal: AnimalMapper.toResponse(animal),
      ancestors: genealogy.ancestors.map(AnimalMapper.toResponse),
      descendants: genealogy.descendants.map(AnimalMapper.toResponse),
    }
  }
}
