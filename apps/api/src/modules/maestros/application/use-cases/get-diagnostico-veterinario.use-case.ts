import { inject, injectable } from 'tsyringe'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { DiagnosticoVeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { DiagnosticoVeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetDiagnosticoVeterinarioUseCase {
  constructor(@inject(DIAGNOSTICO_VETERINARIO_REPOSITORY) private readonly repo: IDiagnosticoVeterinarioRepository) {}
  async execute(id: number): Promise<DiagnosticoVeterinarioResponseDto> {
    const entity = await this.repo.findById(id)
    if (!entity) throw new NotFoundError('DiagnosticoVeterinario', id)
    return DiagnosticoVeterinarioMapper.toResponse(entity)
  }
}
