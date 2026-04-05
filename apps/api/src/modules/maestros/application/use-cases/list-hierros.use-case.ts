import { inject, injectable } from 'tsyringe'
import { HIERRO_REPOSITORY } from '../../domain/repositories/hierro.repository.js'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import type { HierroResponseDto } from '../dtos/maestros.dto.js'
import { HierroMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListHierrosUseCase {
  constructor(@inject(HIERRO_REPOSITORY) private readonly repo: IHierroRepository) {}
  async execute(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(predioId, opts)
    return { data: result.data.map(HierroMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
