import { injectable, inject } from 'tsyringe'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../domain/repositories/diagnostico-veterinario.repository.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class DeleteDiagnosticoVeterinarioUseCase {
  constructor(@inject(DIAGNOSTICO_VETERINARIO_REPOSITORY) private readonly repo: IDiagnosticoVeterinarioRepository) {}
  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundError('DiagnosticoVeterinario', id)
    await this.repo.softDelete(id)
  }
}
