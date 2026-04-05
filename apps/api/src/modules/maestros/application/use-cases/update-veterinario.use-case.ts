import { inject, injectable } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { UpdateVeterinarioDto, VeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { VeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateVeterinarioUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(id: number, dto: UpdateVeterinarioDto, predioId: number): Promise<VeterinarioResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Veterinario', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('Veterinario', id)
    return VeterinarioMapper.toResponse(entity)
  }
}
