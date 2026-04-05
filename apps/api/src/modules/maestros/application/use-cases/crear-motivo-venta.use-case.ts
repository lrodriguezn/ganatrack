import { injectable, inject } from 'tsyringe'
import { MOTIVO_VENTA_REPOSITORY } from '../../domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from '../../domain/repositories/motivo-venta.repository.js'
import type { CreateMotivoVentaDto, MotivoVentaResponseDto } from '../dtos/maestros.dto.js'
import { MotivoVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearMotivoVentaUseCase {
  constructor(@inject(MOTIVO_VENTA_REPOSITORY) private readonly repo: IMotivoVentaRepository) {}
  async execute(dto: CreateMotivoVentaDto): Promise<MotivoVentaResponseDto> {
    const entity = await this.repo.create({ nombre: dto.nombre, descripcion: dto.descripcion ?? null, activo: 1 })
    return MotivoVentaMapper.toResponse(entity)
  }
}
