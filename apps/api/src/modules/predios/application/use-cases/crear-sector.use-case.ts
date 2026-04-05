import { injectable, inject } from 'tsyringe'
import { SECTOR_REPOSITORY } from '../../domain/repositories/sector.repository.js'
import type { ISectorRepository } from '../../domain/repositories/sector.repository.js'
import type { CreateSectorDto, SectorResponseDto } from '../dtos/predios.dto.js'
import { SectorMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearSectorUseCase {
  constructor(
    @inject(SECTOR_REPOSITORY) private readonly repo: ISectorRepository,
  ) {}

  async execute(dto: CreateSectorDto, predioId: number): Promise<SectorResponseDto> {
    const existing = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
    if (existing) {
      throw new ConflictError(`El sector con código '${dto.codigo}' ya existe en este predio`)
    }

    const entity = await this.repo.create({
      predioId,
      codigo: dto.codigo,
      nombre: dto.nombre,
      areaHectareas: dto.areaHectareas ?? null,
      tipoPasto: dto.tipoPasto ?? null,
      capacidadMaxima: dto.capacidadMaxima ?? null,
      estado: dto.estado ?? null,
      activo: 1,
    })

    return SectorMapper.toResponse(entity)
  }
}
