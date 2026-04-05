import { inject, injectable } from 'tsyringe'
import { PREDIO_REPOSITORY } from '../../domain/repositories/predio.repository.js'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import type { PredioResponseDto } from '../dtos/predios.dto.js'
import { PredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetPredioUseCase {
  constructor(
    @inject(PREDIO_REPOSITORY) private readonly repo: IPredioRepository,
  ) {}

  async execute(id: number): Promise<PredioResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) {
      throw new NotFoundError('Predio', id)
    }
    return PredioMapper.toResponse(entity)
  }
}
