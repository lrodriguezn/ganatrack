import { inject, injectable } from 'tsyringe'
import { PARTO_ANIMAL_REPOSITORY } from '../../domain/repositories/parto-animal.repository.js'
import type { IPartoAnimalRepository } from '../../domain/repositories/parto-animal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeletePartoUseCase {
  constructor(
    @inject(PARTO_ANIMAL_REPOSITORY) private readonly repo: IPartoAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('PartoAnimal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
