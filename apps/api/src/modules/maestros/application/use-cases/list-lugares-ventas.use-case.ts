import { inject, injectable } from 'tsyringe'
import { LUGAR_VENTA_REPOSITORY } from '../../domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import type { LugarVentaResponseDto } from '../dtos/maestros.dto.js'
import { LugarVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListLugaresVentasUseCase {
  constructor(@inject(LUGAR_VENTA_REPOSITORY) private readonly repo: ILugarVentaRepository) {}
  async execute(opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(opts)
    return { data: result.data.map(LugarVentaMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
