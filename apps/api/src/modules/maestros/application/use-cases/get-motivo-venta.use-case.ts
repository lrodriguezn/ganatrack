import { inject, injectable } from 'tsyringe'
import { MOTIVO_VENTA_REPOSITORY } from '../../domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import type { MotivoVentaResponseDto } from '../dtos/maestros.dto.js'
import { MotivoVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetMotivoVentaUseCase {
  constructor(@inject(MOTIVO_VENTA_REPOSITORY) private readonly repo: IMotivoVentaRepository) {}
  async execute(id: number): Promise<MotivoVentaResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError('MotivoVenta', id)
    return MotivoVentaMapper.toResponse(entity)
  }
}
