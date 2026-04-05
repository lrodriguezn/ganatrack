import { inject, injectable } from 'tsyringe'
import { CONFIG_PARAMETRO_PREDIO_REPOSITORY } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { IConfigParametroPredioRepository } from '../../domain/repositories/config-parametro-predio.repository.js'
import type { ConfigParametroPredioResponseDto, CreateConfigParametroPredioDto } from '../dtos/predios.dto.js'
import { ConfigParametroPredioMapper } from '../../infrastructure/mappers/predios.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearConfigParametroPredioUseCase {
  constructor(
    @inject(CONFIG_PARAMETRO_PREDIO_REPOSITORY) private readonly repo: IConfigParametroPredioRepository,
  ) {}

  async execute(dto: CreateConfigParametroPredioDto, predioId: number): Promise<ConfigParametroPredioResponseDto> {
    const existing = await this.repo.findByPredioAndCodigo(predioId, dto.codigo)
    if (existing) {
      throw new ConflictError(`El parámetro con código '${dto.codigo}' ya existe en este predio`)
    }

    const entity = await this.repo.create({
      predioId,
      codigo: dto.codigo,
      valor: dto.valor ?? null,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ConfigParametroPredioMapper.toResponse(entity)
  }
}
