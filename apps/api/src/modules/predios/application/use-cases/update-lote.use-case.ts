import { inject, injectable } from 'tsyringe'
import { LOTE_REPOSITORY } from '../../domain/repositories/lote.repository.js'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import type { LoteResponseDto, UpdateLoteDto } from '../dtos/predios.dto.js'
import { LoteMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateLoteUseCase {
  constructor(
    @inject(LOTE_REPOSITORY) private readonly repo: ILoteRepository,
  ) {}

  async execute(id: number, dto: UpdateLoteDto, predioId: number): Promise<LoteResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Lote', id)
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('Lote', id)
    }

    return LoteMapper.toResponse(entity)
  }
}
