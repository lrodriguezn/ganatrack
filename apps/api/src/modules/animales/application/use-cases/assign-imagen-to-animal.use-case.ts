import { inject, injectable } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import { ANIMAL_IMAGEN_REPOSITORY } from '../../domain/repositories/animal-imagen.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from '../../domain/repositories/animal-imagen.repository.js'
import type { AnimalResponseDto, AssignImagenDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class AssignImagenToAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly animalRepo: IAnimalRepository,
    @inject(IMAGEN_REPOSITORY) private readonly imagenRepo: IImagenRepository,
    @inject(ANIMAL_IMAGEN_REPOSITORY) private readonly animalImagenRepo: IAnimalImagenRepository,
  ) {}

  async execute(animalId: number, predioId: number, dto: AssignImagenDto): Promise<AnimalResponseDto> {
    // Verify animal exists
    const animal = await this.animalRepo.findById(animalId, predioId)
    if (!animal) {
      throw new NotFoundError('Animal', animalId)
    }

    // Verify imagen exists and belongs to this predio
    const imagen = await this.imagenRepo.findById(dto.imagenId, predioId)
    if (!imagen) {
      throw new NotFoundError('Imagen', dto.imagenId)
    }

    // Check if assignment already exists
    const existingAssignments = await this.animalImagenRepo.findByAnimal(animalId)
    const alreadyAssigned = existingAssignments.some(a => a.imagenId === dto.imagenId && a.activo === 1)
    if (alreadyAssigned) {
      throw new ConflictError('Esta imagen ya está asignada a este animal')
    }

    // Create assignment
    await this.animalImagenRepo.create({ animalId, imagenId: dto.imagenId })

    return AnimalMapper.toResponse(animal)
  }
}
