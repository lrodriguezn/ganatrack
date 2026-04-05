import { injectable, inject } from 'tsyringe'
import { PREDIO_REPOSITORY } from '../../domain/repositories/predio.repository.js'
import type { IPredioRepository } from '../../domain/repositories/predio.repository.js'
import type { UpdatePredioDto, PredioResponseDto } from '../dtos/predios.dto.js'
import { PredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError, ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdatePredioUseCase {
  constructor(
    @inject(PREDIO_REPOSITORY) private readonly repo: IPredioRepository,
  ) {}

  async execute(id: number, dto: UpdatePredioDto): Promise<PredioResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      throw new NotFoundError('Predio', id)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByCodigo(dto.codigo)
      if (duplicate) {
        throw new ConflictError(`El predio con código '${dto.codigo}' ya existe`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('Predio', id)
    }

    return PredioMapper.toResponse(entity)
  }
}
