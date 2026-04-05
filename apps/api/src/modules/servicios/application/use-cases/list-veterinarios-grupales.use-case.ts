import { injectable, inject } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { VeterinarioGrupalResponseDto } from '../dtos/veterinario.dto.js'
import { VeterinarioGrupalMapper } from '../../infrastructure/mappers/veterinario.mapper.js'

@injectable()
export class ListVeterinariosGrupalesUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly repo: IVeterinarioGrupalRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number }): Promise<{
    data: VeterinarioGrupalResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(VeterinarioGrupalMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
