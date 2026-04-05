import { inject, injectable } from 'tsyringe'
import { LOTE_REPOSITORY } from '../../domain/repositories/lote.repository.js'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import type { LoteResponseDto } from '../dtos/predios.dto.js'
import { LoteMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListLotesUseCase {
  constructor(
    @inject(LOTE_REPOSITORY) private readonly repo: ILoteRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{
    data: LoteResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(LoteMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
