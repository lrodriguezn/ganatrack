import { injectable, inject } from 'tsyringe'
import { INSEMINACION_ANIMAL_REPOSITORY } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class RemoveInseminacionAnimalUseCase {
  constructor(
    @inject(INSEMINACION_ANIMAL_REPOSITORY) private readonly repo: IInseminacionAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('InseminacionAnimal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
