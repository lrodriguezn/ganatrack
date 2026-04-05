import { inject, injectable } from 'tsyringe'
import { LUGAR_COMPRA_REPOSITORY } from '../../domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from '../../domain/repositories/lugar-compra.repository.js'
import type { CreateLugarCompraDto, LugarCompraResponseDto } from '../dtos/maestros.dto.js'
import { LugarCompraMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearLugarCompraUseCase {
  constructor(@inject(LUGAR_COMPRA_REPOSITORY) private readonly repo: ILugarCompraRepository) {}
  async execute(dto: CreateLugarCompraDto): Promise<LugarCompraResponseDto> {
    const entity = await this.repo.create({ nombre: dto.nombre, tipo: dto.tipo ?? null, ubicacion: dto.ubicacion ?? null, contacto: dto.contacto ?? null, telefono: dto.telefono ?? null, activo: 1 })
    return LugarCompraMapper.toResponse(entity)
  }
}
