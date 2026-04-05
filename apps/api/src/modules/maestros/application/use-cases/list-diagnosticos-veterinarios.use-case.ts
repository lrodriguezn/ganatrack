import { inject, injectable } from 'tsyringe'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { DiagnosticoVeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { DiagnosticoVeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListDiagnosticosVeterinariosUseCase {
  constructor(@inject(DIAGNOSTICO_VETERINARIO_REPOSITORY) private readonly repo: IDiagnosticoVeterinarioRepository) {}
  async execute(opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(opts)
    return { data: result.data.map(DiagnosticoVeterinarioMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
