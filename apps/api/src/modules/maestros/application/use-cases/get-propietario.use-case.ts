import { injectable, inject } from 'tsyringe'
import { PROPIETARIO_REPOSITORY } from '../../domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import type { PropietarioResponseDto } from '../dtos/maestros.dto.js'
import { PropietarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetPropietarioUseCase {
  constructor(@inject(PROPIETARIO_REPOSITORY) private readonly repo: IPropietarioRepository) {}
  async execute(id: number, predioId: number): Promise<PropietarioResponseDto> {
    const entity = await this.repo.findById(id, predioId)
    if (!entity) throw new NotFoundError('Propietario', id)
    return PropietarioMapper.toResponse(entity)
  }
}
