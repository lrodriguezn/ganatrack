import { injectable, inject } from 'tsyringe'
import { HIERRO_REPOSITORY } from '../../domain/repositories/hierro.repository.js'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import type { HierroResponseDto } from '../dtos/maestros.dto.js'
import { HierroMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetHierroUseCase {
  constructor(@inject(HIERRO_REPOSITORY) private readonly repo: IHierroRepository) {}
  async execute(id: number, predioId: number): Promise<HierroResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) throw new NotFoundError('Hierro', id)
    return HierroMapper.toResponse(entity)
  }
}
