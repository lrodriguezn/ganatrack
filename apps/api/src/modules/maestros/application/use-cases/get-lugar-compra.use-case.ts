import { injectable, inject } from 'tsyringe'
import { LUGAR_COMPRA_REPOSITORY } from '../../domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import type { LugarCompraResponseDto } from '../dtos/maestros.dto.js'
import { LugarCompraMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetLugarCompraUseCase {
  constructor(@inject(LUGAR_COMPRA_REPOSITORY) private readonly repo: ILugarCompraRepository) {}
  async execute(id: number): Promise<LugarCompraResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError('LugarCompra', id)
    return LugarCompraMapper.toResponse(entity)
  }
}
