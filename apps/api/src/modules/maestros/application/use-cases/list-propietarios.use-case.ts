import { inject, injectable } from 'tsyringe'
import { PROPIETARIO_REPOSITORY } from '../../domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import type { PropietarioResponseDto } from '../dtos/maestros.dto.js'
import { PropietarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class ListPropietariosUseCase {
  constructor(@inject(PROPIETARIO_REPOSITORY) private readonly repo: IPropietarioRepository) {}
  async execute(predioId: number, opts: { page: number; limit: number; search?: string }) {
    const result = await this.repo.findAll(predioId, opts)
    return { data: result.data.map(PropietarioMapper.toResponse), page: opts.page, limit: opts.limit, total: result.total }
  }
}
