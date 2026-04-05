import { inject, injectable } from 'tsyringe'
import { LUGAR_COMPRA_REPOSITORY } from '../../domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import type { LugarCompraResponseDto } from '../dtos/maestros.dto.js'
import { LugarCompraMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListLugaresComprasUseCase {
  constructor(@inject(LUGAR_COMPRA_REPOSITORY) private readonly repo: ILugarCompraRepository) {}
  async execute(opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(opts)
    return { data: result.data.map(LugarCompraMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
