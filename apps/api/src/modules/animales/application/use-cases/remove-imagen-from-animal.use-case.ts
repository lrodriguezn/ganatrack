import { injectable, inject } from 'tsyringe'
import { ANIMAL_REPOSITORY } from '../../domain/repositories/animal.repository.js'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import { ANIMAL_IMAGEN_REPOSITORY } from '../../domain/repositories/animal-imagen.repository.js'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { IAnimalImagenRepository } from '../../domain/repositories/animal-imagen.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class RemoveImagenFromAnimalUseCase {
  constructor(
    @inject(ANIMAL_REPOSITORY) private readonly animalRepo: IAnimalRepository,
    @inject(IMAGEN_REPOSITORY) private readonly imagenRepo: IImagenRepository,
    @inject(ANIMAL_IMAGEN_REPOSITORY) private readonly animalImagenRepo: IAnimalImagenRepository,
  ) {}

  async execute(animalId: number, imagenId: number, predioId: number): Promise<void> {
    // Verify animal exists
    const animal = await this.animalRepo.findById(animalId, predioId)
    if (!animal) {
      throw new NotFoundError('Animal', animalId)
    }

    // Verify imagen exists
    const imagen = await this.imagenRepo.findById(imagenId, predioId)
    if (!imagen) {
      throw new NotFoundError('Imagen', imagenId)
    }

    // Check if assignment exists
    const assignments = await this.animalImagenRepo.findByAnimal(animalId)
    const assignment = assignments.find(a => a.imagenId === imagenId && a.activo === 1)
    if (!assignment) {
      throw new NotFoundError('La imagen no está asignada a este animal', 0)
    }

    // Remove assignment
    await this.animalImagenRepo.delete(animalId, imagenId)
  }
}
