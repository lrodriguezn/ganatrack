import { inject, injectable } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import { ANIMAL_IMAGEN_REPOSITORY } from '../../domain/repositories/animal-imagen.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from '../../domain/repositories/animal-imagen.repository.js'
import type { AnimalResponseDto } from '../dtos/animal.dto.js'
import { AnimalMapper } from '../../infrastructure/mappers/animal.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class ListImagenAnimalesUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly animalRepo: IAnimalRepository,
    @inject(IMAGEN_REPOSITORY) private readonly imagenRepo: IImagenRepository,
    @inject(ANIMAL_IMAGEN_REPOSITORY) private readonly animalImagenRepo: IAnimalImagenRepository,
  ) {}

  async execute(imagenId: number, predioId: number): Promise<AnimalResponseDto[]> {
    // Verify imagen exists
    const imagen = await this.imagenRepo.findById(imagenId, predioId)
    if (!imagen) {
      throw new NotFoundError('Imagen', imagenId)
    }

    // Get assignments
    const assignments = await this.animalImagenRepo.findByImagen(imagenId)

    // Fetch animales
    const animales: AnimalResponseDto[] = []
    for (const assignment of assignments) {
      const animal = await this.animalRepo.findById(assignment.animalId, predioId)
      if (animal && animal.activo === 1) {
        animales.push(AnimalMapper.toResponse(animal))
      }
    }

    return animales
  }
}
