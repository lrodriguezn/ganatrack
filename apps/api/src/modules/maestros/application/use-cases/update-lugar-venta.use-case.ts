import { injectable, inject } from 'tsyringe'
import { LUGAR_VENTA_REPOSITORY } from '../../domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import type { UpdateLugarVentaDto, LugarVentaResponseDto } from '../dtos/maestros.dto.js'
import { LugarVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateLugarVentaUseCase {
  constructor(@inject(LUGAR_VENTA_REPOSITORY) private readonly repo: ILugarVentaRepository) {}
  async execute(id: number, dto: UpdateLugarVentaDto): Promise<LugarVentaResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('LugarVenta', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('LugarVenta', id)
    return LugarVentaMapper.toResponse(entity)
  }
}
