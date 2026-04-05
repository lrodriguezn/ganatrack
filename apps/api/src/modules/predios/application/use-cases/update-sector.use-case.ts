import { injectable, inject } from 'tsyringe'
import { SECTOR_REPOSITORY } from '../../domain/repositories/sector.repository.js'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import type { UpdateSectorDto, SectorResponseDto } from '../dtos/predios.dto.js'
import { SectorMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError, ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateSectorUseCase {
  constructor(
    @inject(SECTOR_REPOSITORY) private readonly repo: ISectorRepository,
  ) {}

  async execute(id: number, dto: UpdateSectorDto, predioId: number): Promise<SectorResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Sector', id)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
      if (duplicate) {
        throw new ConflictError(`El sector con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('Sector', id)
    }

    return SectorMapper.toResponse(entity)
  }
}
