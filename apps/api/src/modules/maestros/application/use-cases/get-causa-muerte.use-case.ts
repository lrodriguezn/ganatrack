import { injectable, inject } from 'tsyringe'
import { CAUSA_MUERTE_REPOSITORY } from '../../domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import type { CausaMuerteResponseDto } from '../dtos/maestros.dto.js'
import { CausaMuerteMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetCausaMuerteUseCase {
  constructor(@inject(CAUSA_MUERTE_REPOSITORY) private readonly repo: ICausaMuerteRepository) {}
  async execute(id: number): Promise<CausaMuerteResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError('CausaMuerte', id)
    return CausaMuerteMapper.toResponse(entity)
  }
}
