import { injectable, inject } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { CreateVeterinarioDto, VeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { VeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearVeterinarioUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(dto: CreateVeterinarioDto, predioId: number): Promise<VeterinarioResponseDto> {
    const entity = await this.repo.create({ ...dto, predioId, telefono: dto.telefono ?? null, email: dto.email ?? null, direccion: dto.direccion ?? null, numeroRegistro: dto.numeroRegistro ?? null, especialidad: dto.especialidad ?? null, activo: 1 })
    return VeterinarioMapper.toResponse(entity)
  }
}
