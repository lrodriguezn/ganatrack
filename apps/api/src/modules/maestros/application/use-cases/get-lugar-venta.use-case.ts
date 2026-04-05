import { inject, injectable } from 'tsyringe'
import { LUGAR_VENTA_REPOSITORY } from '../../domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import type { LugarVentaResponseDto } from '../dtos/maestros.dto.js'
import { LugarVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetLugarVentaUseCase {
  constructor(@inject(LUGAR_VENTA_REPOSITORY) private readonly repo: ILugarVentaRepository) {}
  async execute(id: number): Promise<LugarVentaResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError('LugarVenta', id)
    return LugarVentaMapper.toResponse(entity)
  }
}
