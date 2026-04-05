import { inject, injectable } from 'tsyringe'
import { POTRERO_REPOSITORY } from '../../domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import type { PotreroResponseDto } from '../dtos/predios.dto.js'
import { PotreroMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetPotreroUseCase {
  constructor(
    @inject(POTRERO_REPOSITORY) private readonly repo: IPotreroRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<PotreroResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Potrero', id)
    }
    return PotreroMapper.toResponse(entity)
  }
}
