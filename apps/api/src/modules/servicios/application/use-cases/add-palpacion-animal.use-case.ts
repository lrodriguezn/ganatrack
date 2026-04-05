import { injectable, inject } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import { PALPACION_ANIMAL_REPOSITORY } from '../../domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import type { CreatePalpacionAnimalDto, PalpacionAnimalResponseDto } from '../dtos/palpacion.dto.js'
import { PalpacionAnimalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class AddPalpacionAnimalUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IPalpacionGrupalRepository,
    @inject(PALPACION_ANIMAL_REPOSITORY) private readonly repo: IPalpacionAnimalRepository,
  ) {}

  async execute(grupalId: number, dto: CreatePalpacionAnimalDto, predioId: number): Promise<PalpacionAnimalResponseDto> {
    // Verify grupal exists and belongs to predio
    const grupal = await this.grupalRepo.findById(grupalId, predioId)
    if (!grupal) {
      throw new NotFoundError('PalpacionGrupal', grupalId)
    }

    const animal = await this.repo.create({
      palpacionGrupalId: grupalId,
      animalId: dto.animalId,
      veterinarioId: dto.veterinarioId ?? null,
      diagnosticoId: dto.diagnosticoId ?? null,
      condicionCorporalId: dto.condicionCorporalId ?? null,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      diasGestacion: dto.diasGestacion ?? null,
      fechaParto: dto.fechaParto ? new Date(dto.fechaParto) : null,
      comentarios: dto.comentarios ?? null,
      activo: 1,
    })

    return PalpacionAnimalMapper.toResponse(animal)
  }
}
