import { injectable, inject } from 'tsyringe'
import { LUGAR_COMPRA_REPOSITORY } from '../../domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import type { UpdateLugarCompraDto, LugarCompraResponseDto } from '../dtos/maestros.dto.js'
import { LugarCompraMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateLugarCompraUseCase {
  constructor(@inject(LUGAR_COMPRA_REPOSITORY) private readonly repo: ILugarCompraRepository) {}
  async execute(id: number, dto: UpdateLugarCompraDto): Promise<LugarCompraResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('LugarCompra', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('LugarCompra', id)
    return LugarCompraMapper.toResponse(entity)
  }
}
