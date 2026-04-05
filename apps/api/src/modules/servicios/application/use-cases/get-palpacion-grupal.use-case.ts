import { injectable, inject } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import { PALPACION_ANIMAL_REPOSITORY } from '../../domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import type { PalpacionGrupalResponseDto } from '../dtos/palpacion.dto.js'
import { PalpacionGrupalMapper, PalpacionAnimalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetPalpacionGrupalUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IPalpacionGrupalRepository,
    @inject(PALPACION_ANIMAL_REPOSITORY) private readonly animalRepo: IPalpacionAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<PalpacionGrupalResponseDto> {
    const grupal = await this.grupalRepo.findById(id, predioId)
    if (!grupal) {
      throw new NotFoundError('PalpacionGrupal', id)
    }

    const animales = await this.animalRepo.findByGrupalId(id)

    return {
      ...PalpacionGrupalMapper.toResponse(grupal),
      animales: animales.map(PalpacionAnimalMapper.toResponse),
    }
  }
}
