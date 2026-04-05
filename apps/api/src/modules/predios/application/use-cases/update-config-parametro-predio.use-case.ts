import { inject, injectable } from 'tsyringe'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { ConfigParametroPredioResponseDto, UpdateConfigParametroPredioDto } from '../dtos/predios.dto.js'
import { ConfigParametroPredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateConfigParametroPredioUseCase {
  constructor(
    @inject(CONFIG_PARAMETRO_PREDIO_REPOSITORY) private readonly repo: IConfigParametroPredioRepository,
  ) {}

  async execute(id: number, dto: UpdateConfigParametroPredioDto, predioId: number): Promise<ConfigParametroPredioResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('ConfigParametroPredio', id)
    }

    if (dto.codigo && dto.codigo !== existing.codigo) {
      const duplicate = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
      if (duplicate) {
        throw new ConflictError(`El parámetro con código '${dto.codigo}' ya existe en este predio`)
      }
    }

    const entity = await this.repo.update(id, dto)
    if (!entity) {
      throw new NotFoundError('ConfigParametroPredio', id)
    }

    return ConfigParametroPredioMapper.toResponse(entity)
  }
}
