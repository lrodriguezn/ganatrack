import { injectable, inject } from 'tsyringe'
import { PREDIO_REPOSITORY } from '../../domain/repositories/predio.repository.js'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import type { CreatePredioDto, PredioResponseDto } from '../dtos/predios.dto.js'
import { PredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearPredioUseCase {
  constructor(
    @inject(PREDIO_REPOSITORY) private readonly repo: IPredioRepository,
  ) {}

  async execute(dto: CreatePredioDto): Promise<PredioResponseDto> {
    const existing = await this.repo.findByCodigo(dto.codigo)
    if (existing) {
      throw new ConflictError(`El predio con código '${dto.codigo}' ya existe`)
    }

    const entity = await this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      departamento: dto.departamento ?? null,
      municipio: dto.municipio ?? null,
      vereda: dto.vereda ?? null,
      areaHectareas: dto.areaHectareas ?? null,
      capacidadMaxima: dto.capacidadMaxima ?? null,
      tipoExplotacionId: dto.tipoExplotacionId ?? null,
      activo: 1,
    })

    return PredioMapper.toResponse(entity)
  }
}
