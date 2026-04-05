import { injectable, inject } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { AnimalResponseDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly repo: IAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<AnimalResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Animal', id)
    }
    return AnimalMapper.toResponse(entity)
  }
}
