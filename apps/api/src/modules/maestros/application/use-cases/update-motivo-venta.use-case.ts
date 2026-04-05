import { injectable, inject } from 'tsyringe'
import { MOTIVO_VENTA_REPOSITORY } from '../../domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import type { UpdateMotivoVentaDto, MotivoVentaResponseDto } from '../dtos/maestros.dto.js'
import { MotivoVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateMotivoVentaUseCase {
  constructor(@inject(MOTIVO_VENTA_REPOSITORY) private readonly repo: IMotivoVentaRepository) {}
  async execute(id: number, dto: UpdateMotivoVentaDto): Promise<MotivoVentaResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('MotivoVenta', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('MotivoVenta', id)
    return MotivoVentaMapper.toResponse(entity)
  }
}
