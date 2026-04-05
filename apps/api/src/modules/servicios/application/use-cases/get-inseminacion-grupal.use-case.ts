import { inject, injectable } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import { INSEMINACION_ANIMAL_REPOSITORY } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { InseminacionGrupalResponseDto } from '../dtos/inseminacion.dto.js'
import { InseminacionAnimalMapper, InseminacionGrupalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetInseminacionGrupalUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IInseminacionGrupalRepository,
    @inject(INSEMINACION_ANIMAL_REPOSITORY) private readonly animalRepo: IInseminacionAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<InseminacionGrupalResponseDto> {
    const grupal = await this.grupalRepo.findById(id, predioId)
    if (!grupal) {
      throw new NotFoundError('InseminacionGrupal', id)
    }

    const animales = await this.animalRepo.findByGrupalId(id)

    return {
      ...InseminacionGrupalMapper.toResponse(grupal),
      animales: animales.map(InseminacionAnimalMapper.toResponse),
    }
  }
}
