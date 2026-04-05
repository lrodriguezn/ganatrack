import { injectable, inject } from 'tsyringe'
import { MOTIVO_VENTA_REPOSITORY } from '../../domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import type { MotivoVentaResponseDto } from '../dtos/maestros.dto.js'
import { MotivoVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListMotivosVentasUseCase {
  constructor(@inject(MOTIVO_VENTA_REPOSITORY) private readonly repo: IMotivoVentaRepository) {}
  async execute(opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(opts)
    return { data: result.data.map(MotivoVentaMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
