import { injectable, inject } from 'tsyringe'
import { PARTO_ANIMAL_REPOSITORY } from '../../domain/repositories/parto-animal.repository.js'
import { PARTO_CRIA_REPOSITORY } from '../../domain/repositories/parto-cria.repository.js'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import type { IPartoCriaRepository } from '../../domain/repositories/parto-cria.repository.js'
import type { PartoAnimalResponseDto } from '../dtos/parto.dto.js'
import { PartoAnimalMapper, PartoCriaMapper } from '../../infrastructure/mappers/parto.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetPartoUseCase {
  constructor(
    @inject(PARTO_ANIMAL_REPOSITORY) private readonly repo: IPartoAnimalRepository,
    @inject(PARTO_CRIA_REPOSITORY) private readonly criaRepo: IPartoCriaRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<PartoAnimalResponseDto> {
    const parto = await this.repo.findById(id, predioId)
    if (!parto) {
      throw new NotFoundError('PartoAnimal', id)
    }

    const crias = await this.criaRepo.findByPartoId(id)

    return {
      ...PartoAnimalMapper.toResponse(parto),
      crias: crias.map(PartoCriaMapper.toResponse),
    }
  }
}
