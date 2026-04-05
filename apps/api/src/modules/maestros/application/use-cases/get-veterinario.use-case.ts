import { inject, injectable } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { VeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { VeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetVeterinarioUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(id: number, predioId: number): Promise<VeterinarioResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) throw new NotFoundError('Veterinario', id)
    return VeterinarioMapper.toResponse(entity)
  }
}
