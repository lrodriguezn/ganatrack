import { injectable, inject } from 'tsyringe'
import { LUGAR_VENTA_REPOSITORY } from '../../domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteLugarVentaUseCase {
  constructor(@inject(LUGAR_VENTA_REPOSITORY) private readonly repo: ILugarVentaRepository) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('LugarVenta', id)
    await this.repo.softDelete(id)
  }
}
