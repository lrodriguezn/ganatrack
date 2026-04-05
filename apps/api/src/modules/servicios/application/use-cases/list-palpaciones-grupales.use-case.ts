import { injectable, inject } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { PalpacionGrupalResponseDto } from '../dtos/palpacion.dto.js'
import { PalpacionGrupalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'

@injectable()
export class ListPalpacionesGrupalesUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly repo: IPalpacionGrupalRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: PalpacionGrupalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(PalpacionGrupalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
