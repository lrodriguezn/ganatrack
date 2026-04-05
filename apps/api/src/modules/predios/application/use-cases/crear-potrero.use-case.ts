import { inject, injectable } from 'tsyringe'
import { POTRERO_REPOSITORY } from '../../domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import type { CreatePotreroDto, PotreroResponseDto } from '../dtos/predios.dto.js'
import { PotreroMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearPotreroUseCase {
  constructor(
    @inject(POTRERO_REPOSITORY) private readonly repo: IPotreroRepository,
  ) {}

  async execute(dto: CreatePotreroDto, predioId: number): Promise<PotreroResponseDto> {
    const existing = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
    if (existing) {
      throw new ConflictError(`El potrero con código '${dto.codigo}' ya existe en este predio`)
    }

    const entity = await this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      predioId,
      areaHectareas: dto.areaHectareas ?? null,
      tipoPasto: dto.tipoPasto ?? null,
      capacidadMaxima: dto.capacidadMaxima ?? null,
      estado: dto.estado ?? null,
      activo: 1,
    })

    return PotreroMapper.toResponse(entity)
  }
}
