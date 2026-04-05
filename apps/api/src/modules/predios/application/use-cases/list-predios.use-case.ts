import { inject, injectable } from 'tsyringe'
import { PREDIO_REPOSITORY } from '../../domain/repositories/predio.repository.js'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import type { PredioResponseDto } from '../dtos/predios.dto.js'
import { PredioMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListPrediosUseCase {
  constructor(
    @inject(PREDIO_REPOSITORY) private readonly repo: IPredioRepository,
  ) {}

  async execute(opts: { page: number; limit: number; search?: string }): Promise<{
    data: PredioResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(opts)
    return {
      data: result.data.map(PredioMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
