import { inject, injectable } from 'tsyringe'
import { PRODUCTO_REPOSITORY } from '../../domain/repositories/producto.repository.js'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteProductoUseCase {
  constructor(
    @inject(PRODUCTO_REPOSITORY) private readonly repo: IProductoRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<void> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Producto', id)
    }

    await this.repo.softDelete(id, predioId)
  }
}
