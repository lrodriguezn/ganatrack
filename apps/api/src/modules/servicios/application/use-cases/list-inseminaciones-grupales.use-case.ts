import { injectable, inject } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { InseminacionGrupalResponseDto } from '../dtos/inseminacion.dto.js'
import { InseminacionGrupalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'

@injectable()
export class ListInseminacionesGrupalesUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly repo: IInseminacionGrupalRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: InseminacionGrupalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(InseminacionGrupalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
