import { inject, injectable } from 'tsyringe'
import { POTRERO_REPOSITORY } from '../../domain/repositories/potrero.repository.js'
import type { IPotreroRepository } from '../../domain/repositories/potrero.repository.js'
import type { PotreroResponseDto, UpdatePotreroDto } from '../dtos/predios.dto.js'
import { PotreroMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdatePotreroUseCase {
  constructor(
    @inject(POTRERO_REPOSITORY) private readonly repo: IPotreroRepository,
  ) {}

  async execute(id: number, dto: UpdatePotreroDto, predioId: number): Promise<PotreroResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Potrero', id)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
      if (duplicate) {
        throw new ConflictError(`El potrero con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('Potrero', id)
    }

    return PotreroMapper.toResponse(entity)
  }
}
