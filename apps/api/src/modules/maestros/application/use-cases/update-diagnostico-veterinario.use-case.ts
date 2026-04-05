import { inject, injectable } from 'tsyringe'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { DiagnosticoVeterinarioResponseDto, UpdateDiagnosticoVeterinarioDto } from '../dtos/maestros.dto.js'
import { DiagnosticoVeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateDiagnosticoVeterinarioUseCase {
  constructor(@inject(DIAGNOSTICO_VETERINARIO_REPOSITORY) private readonly repo: IDiagnosticoVeterinarioRepository) {}
  async execute(id: number, dto: UpdateDiagnosticoVeterinarioDto): Promise<DiagnosticoVeterinarioResponseDto> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('DiagnosticoVeterinario', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('DiagnosticoVeterinario', id)
    return DiagnosticoVeterinarioMapper.toResponse(entity)
  }
}
