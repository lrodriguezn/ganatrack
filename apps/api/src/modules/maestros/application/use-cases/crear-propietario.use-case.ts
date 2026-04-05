import { injectable, inject } from 'tsyringe'
import { PROPIETARIO_REPOSITORY } from '../../domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import type { CreatePropietarioDto, PropietarioResponseDto } from '../dtos/maestros.dto.js'
import { PropietarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearPropietarioUseCase {
  constructor(@inject(PROPIETARIO_REPOSITORY) private readonly repo: IPropietarioRepository) {}
  async execute(dto: CreatePropietarioDto, predioId: number): Promise<PropietarioResponseDto> {
    const entity = await this.repo.create({ ...dto, predioId, tipoDocumento: dto.tipoDocumento ?? null, numeroDocumento: dto.numeroDocumento ?? null, telefono: dto.telefono ?? null, email: dto.email ?? null, direccion: dto.direccion ?? null, activo: 1 })
    return PropietarioMapper.toResponse(entity)
  }
}
