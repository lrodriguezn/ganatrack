import { inject, injectable } from 'tsyringe'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { CreateDiagnosticoVeterinarioDto, DiagnosticoVeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { DiagnosticoVeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearDiagnosticoVeterinarioUseCase {
  constructor(@inject(DIAGNOSTICO_VETERINARIO_REPOSITORY) private readonly repo: IDiagnosticoVeterinarioRepository) {}
  async execute(dto: CreateDiagnosticoVeterinarioDto): Promise<DiagnosticoVeterinarioResponseDto> {
    const entity = await this.repo.create({ nombre: dto.nombre, descripcion: dto.descripcion ?? null, categoria: dto.categoria ?? null, activo: 1 })
    return DiagnosticoVeterinarioMapper.toResponse(entity)
  }
}
