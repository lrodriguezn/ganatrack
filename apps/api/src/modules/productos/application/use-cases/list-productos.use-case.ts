import { inject, injectable } from 'tsyringe'
import { PRODUCTO_REPOSITORY } from '../../domain/repositories/producto.repository.js'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import type { ProductoResponseDto } from '../dtos/producto.dto.js'
import { ProductoMapper } from '../../infrastructure/mappers/producto.mapper.js'

@injectable()
export class ListProductosUseCase {
  constructor(
    @inject(PRODUCTO_REPOSITORY) private readonly repo: IProductoRepository,
  ) {}

  async execute(predioId: number, opts: { page: number; limit: number; tipoProducto?: string }): Promise<{
    data: ProductoResponseDto[]
    page: number
    limit: number
    total: number
  }> {
    const result = await this.repo.findAll(predioId, opts)
    return {
      data: result.data.map(ProductoMapper.toResponse),
      page: opts.page,
      limit: opts.limit,
      total: result.total,
    }
  }
}
