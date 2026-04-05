import { injectable, inject } from 'tsyringe'
import { CAUSA_MUERTE_REPOSITORY } from '../../domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import type { UpdateCausaMuerteDto, CausaMuerteResponseDto } from '../dtos/maestros.dto.js'
import { CausaMuerteMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateCausaMuerteUseCase {
  constructor(@inject(CAUSA_MUERTE_REPOSITORY) private readonly repo: ICausaMuerteRepository) {}
  async execute(id: number, dto: UpdateCausaMuerteDto): Promise<CausaMuerteResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('CausaMuerte', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('CausaMuerte', id)
    return CausaMuerteMapper.toResponse(entity)
  }
}
