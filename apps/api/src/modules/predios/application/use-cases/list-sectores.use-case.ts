import { injectable, inject } from 'tsyringe'
import { SECTOR_REPOSITORY } from '../../domain/repositories/sector.repository.js'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import type { SectorResponseDto } from '../dtos/predios.dto.js'
import { SectorMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListSectoresUseCase {
  constructor(
    @inject(SECTOR_REPOSITORY) private readonly repo: ISectorRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{
    data: SectorResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(SectorMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
