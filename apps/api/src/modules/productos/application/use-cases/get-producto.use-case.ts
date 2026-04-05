import { inject, injectable } from 'tsyringe'
import { PRODUCTO_REPOSITORY } from '../../domain/repositories/producto.repository.js'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import type { ProductoResponseDto } from '../dtos/producto.dto.js'
import { ProductoMapper } from '../../infrastructure/mappers/producto.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetProductoUseCase {
  constructor(
    @inject(PRODUCTO_REPOSITORY) private readonly repo: IProductoRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<ProductoResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) {
      throw new NotFoundError('Producto', id)
    }
    return ProductoMapper.toResponse(entity)
  }
}
