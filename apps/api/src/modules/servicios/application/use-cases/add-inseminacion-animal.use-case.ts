import { inject, injectable } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import { INSEMINACION_ANIMAL_REPOSITORY } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { CreateInseminacionAnimalDto, InseminacionAnimalResponseDto } from '../dtos/inseminacion.dto.js'
import { InseminacionAnimalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class AddInseminacionAnimalUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IInseminacionGrupalRepository,
    @inject(INSEMINACION_ANIMAL_REPOSITORY) private readonly repo: IInseminacionAnimalRepository,
  ) {}

  async execute(grupalId: number, dto: CreateInseminacionAnimalDto, predioId: number): Promise<InseminacionAnimalResponseDto> {
    const grupal = await this.grupalRepo.findById(grupalId, predioId)
    if (!grupal) {
      throw new NotFoundError('InseminacionGrupal', grupalId)
    }

    const animal = await this.repo.create({
      inseminacionGrupalId: grupalId,
      animalId: dto.animalId,
      veterinarioId: dto.veterinarioId ?? null,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      tipoInseminacionKey: dto.tipoInseminacionKey ?? null,
      codigoPajuela: dto.codigoPajuela ?? null,
      diagnosticoId: dto.diagnosticoId ?? null,
      observaciones: dto.observaciones ?? null,
      activo: 1,
    })

    return InseminacionAnimalMapper.toResponse(animal)
  }
}
