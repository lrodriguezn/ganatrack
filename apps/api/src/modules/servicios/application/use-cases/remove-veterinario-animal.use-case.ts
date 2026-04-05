import { injectable, inject } from 'tsyringe'
import { VETERINARIO_ANIMAL_REPOSITORY } from '../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class RemoveVeterinarioAnimalUseCase {
  constructor(
    @inject(VETERINARIO_ANIMAL_REPOSITORY) private readonly repo: IVeterinarioAnimalRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('VeterinarioAnimal', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
