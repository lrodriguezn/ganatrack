import { inject, injectable } from 'tsyringe'
import { LUGAR_COMPRA_REPOSITORY } from '../../domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteLugarCompraUseCase {
  constructor(@inject(LUGAR_COMPRA_REPOSITORY) private readonly repo: ILugarCompraRepository) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('LugarCompra', id)
    await this.repo.softDelete(id)
  }
}
