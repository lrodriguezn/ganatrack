import { inject, injectable } from 'tsyringe'
import { HIERRO_REPOSITORY } from '../../domain/repositories/hierro.repository.js'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import type { HierroResponseDto, UpdateHierroDto } from '../dtos/maestros.dto.js'
import { HierroMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateHierroUseCase {
  constructor(@inject(HIERRO_REPOSITORY) private readonly repo: IHierroRepository) {}
  async execute(id: number, dto: UpdateHierroDto, predioId: number): Promise<HierroResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Hierro', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('Hierro', id)
    return HierroMapper.toResponse(entity)
  }
}
