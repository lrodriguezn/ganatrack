import { injectable, inject } from 'tsyringe'
import { LUGAR_VENTA_REPOSITORY } from '../../domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from '../../domain/repositories/lugar-venta.repository.js'
import type { CreateLugarVentaDto, LugarVentaResponseDto } from '../dtos/maestros.dto.js'
import { LugarVentaMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearLugarVentaUseCase {
  constructor(@inject(LUGAR_VENTA_REPOSITORY) private readonly repo: ILugarVentaRepository) {}
  async execute(dto: CreateLugarVentaDto): Promise<LugarVentaResponseDto> {
    const entity = await this.repo.create({ nombre: dto.nombre, tipo: dto.tipo ?? null, ubicacion: dto.ubicacion ?? null, contacto: dto.contacto ?? null, telefono: dto.telefono ?? null, activo: 1 })
    return LugarVentaMapper.toResponse(entity)
  }
}
