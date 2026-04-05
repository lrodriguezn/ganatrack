import { inject, injectable } from 'tsyringe'
import { MOTIVO_VENTA_REPOSITORY } from '../../domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteMotivoVentaUseCase {
  constructor(@inject(MOTIVO_VENTA_REPOSITORY) private readonly repo: IMotivoVentaRepository) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('MotivoVenta', id)
    await this.repo.softDelete(id)
  }
}
