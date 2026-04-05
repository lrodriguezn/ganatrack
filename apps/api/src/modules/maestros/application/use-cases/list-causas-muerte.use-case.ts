import { inject, injectable } from 'tsyringe'
import { CAUSA_MUERTE_REPOSITORY } from '../../domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import type { CausaMuerteResponseDto } from '../dtos/maestros.dto.js'
import { CausaMuerteMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListCausasMuerteUseCase {
  constructor(@inject(CAUSA_MUERTE_REPOSITORY) private readonly repo: ICausaMuerteRepository) {}
  async execute(opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(opts)
    return { data: result.data.map(CausaMuerteMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
