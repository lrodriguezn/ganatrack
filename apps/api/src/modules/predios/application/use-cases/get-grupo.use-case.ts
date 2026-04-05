import { inject, injectable } from 'tsyringe'
import { GRUPO_REPOSITORY } from '../../domain/repositories/grupo.repository.js'
import type { IGrupoRepository } from '../../domain/repositories/grupo.repository.js'
import type { GrupoResponseDto } from '../dtos/predios.dto.js'
import { GrupoMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetGrupoUseCase {
  constructor(
    @inject(GRUPO_REPOSITORY) private readonly repo: IGrupoRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<GrupoResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Grupo', id)
    }
    return GrupoMapper.toResponse(entity)
  }
}
