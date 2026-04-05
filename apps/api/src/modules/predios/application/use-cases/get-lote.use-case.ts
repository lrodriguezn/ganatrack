import { injectable, inject } from 'tsyringe'
import { LOTE_REPOSITORY } from '../../domain/repositories/lote.repository.js'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import type { LoteResponseDto } from '../dtos/predios.dto.js'
import { LoteMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetLoteUseCase {
  constructor(
    @inject(LOTE_REPOSITORY) private readonly repo: ILoteRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<LoteResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Lote', id)
    }
    return LoteMapper.toResponse(entity)
  }
}
