import { injectable, inject } from 'tsyringe'
import { GRUPO_REPOSITORY } from '../../domain/repositories/grupo.repository.js'
import type { IGrupoRepository } from '../../domain/repositories/grupo.repository.js'
import type { GrupoResponseDto } from '../dtos/predios.dto.js'
import { GrupoMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListGruposUseCase {
  constructor(
    @inject(GRUPO_REPOSITORY) private readonly repo: IGrupoRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{
    data: GrupoResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(GrupoMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
