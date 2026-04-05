import { injectable, inject } from 'tsyringe'
import { SECTOR_REPOSITORY } from '../../domain/repositories/sector.repository.js'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import type { SectorResponseDto } from '../dtos/predios.dto.js'
import { SectorMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetSectorUseCase {
  constructor(
    @inject(SECTOR_REPOSITORY) private readonly repo: ISectorRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<SectorResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Sector', id)
    }
    return SectorMapper.toResponse(entity)
  }
}
