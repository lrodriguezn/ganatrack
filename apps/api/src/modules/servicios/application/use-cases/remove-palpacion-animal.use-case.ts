import { inject, injectable } from 'tsyringe'
import { PALPACION_ANIMAL_REPOSITORY } from '../../domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class RemovePalpacionAnimalUseCase {
  constructor(
    @inject(PALPACION_ANIMAL_REPOSITORY) private readonly repo: IPalpacionAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PalpacionAnimal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
