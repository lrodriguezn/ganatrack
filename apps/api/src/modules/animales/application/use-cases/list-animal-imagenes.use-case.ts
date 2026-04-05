import { inject, injectable } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import { ANIMAL_IMAGEN_REPOSITORY } from '../../domain/repositories/animal-imagen.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from '../../domain/repositories/animal-imagen.repository.js'
import type { ImagenResponseDto } from '../dtos/animal.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class ListAnimalImagenesUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly animalRepo: IAnimalRepository,
    @inject(IMAGEN_REPOSITORY) private readonly imagenRepo: IImagenRepository,
    @inject(ANIMAL_IMAGEN_REPOSITORY) private readonly animalImagenRepo: IAnimalImagenRepository,
  ) {}

  async execute(animalId: number, predioId: number): Promise<ImagenResponseDto[]> {
    // Verify animal exists
    const animal = await this.animalRepo.findById(animalId, predioId)
    if (!animal) {
      throw new NotFoundError('Animal', animalId)
    }

    // Get assignments
    const assignments = await this.animalImagenRepo.findByAnimal(animalId)

    // Fetch imagenes
    const imagenes: ImagenResponseDto[] = []
    for (const assignment of assignments) {
      const imagen = await this.imagenRepo.findById(assignment.imagenId, predioId)
      if (imagen && imagen.activo === 1) {
        imagenes.push(ImagenMapper.toResponse(imagen))
      }
    }

    return imagenes
  }
}
