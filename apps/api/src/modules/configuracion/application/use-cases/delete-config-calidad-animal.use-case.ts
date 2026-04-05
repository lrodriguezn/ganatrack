import { injectable, inject } from 'tsyringe'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from '../../domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../domain/repositories/config-calidad-animal.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteConfigCalidadAnimalUseCase {
  constructor(
    @inject(CONFIG_CALIDAD_ANIMAL_REPOSITORY) private readonly repo: IConfigCalidadAnimalRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('ConfigCalidadAnimal', id)
    }

    await this.repo.softDelete(id)
  }
}
