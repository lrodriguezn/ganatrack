import { inject, injectable } from 'tsyringe'
import { VETERINARIO_REPOSITORY } from '../../domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from '../../domain/repositories/veterinario.repository.js'
import type { VeterinarioResponseDto } from '../dtos/maestros.dto.js'
import { VeterinarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListVeterinariosUseCase {
  constructor(@inject(VETERINARIO_REPOSITORY) private readonly repo: IVeterinarioRepository) {}
  async execute(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(predioId, opts)
    return { data: result.data.map(VeterinarioMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
