import { inject, injectable } from 'tsyringe'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { ConfigParametroPredioResponseDto } from '../dtos/predios.dto.js'
import { ConfigParametroPredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetConfigParametroPredioUseCase {
  constructor(
    @inject(CONFIG_PARAMETRO_PREDIO_REPOSITORY) private readonly repo: IConfigParametroPredioRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<ConfigParametroPredioResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('ConfigParametroPredio', id)
    }
    return ConfigParametroPredioMapper.toResponse(entity)
  }
}
