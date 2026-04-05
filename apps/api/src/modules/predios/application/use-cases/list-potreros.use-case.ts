import { inject, injectable } from 'tsyringe'
import { POTRERO_REPOSITORY } from '../../domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import type { PotreroResponseDto } from '../dtos/predios.dto.js'
import { PotreroMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class ListPotrerosUseCase {
  constructor(
    @inject(POTRERO_REPOSITORY) private readonly repo: IPotreroRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; search?: string }): Promise<{
    data: PotreroResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(PotreroMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
