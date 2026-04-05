import { inject, injectable } from 'tsyringe'
import { PROPIETARIO_REPOSITORY } from '../../domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from '../../domain/repositories/propietario.repository.js'
import type { PropietarioResponseDto, UpdatePropietarioDto } from '../dtos/maestros.dto.js'
import { PropietarioMapper } from '../../infrastructure/mappers/maestros.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdatePropietarioUseCase {
  constructor(@inject(PROPIETARIO_REPOSITORY) private readonly repo: IPropietarioRepository) {}
  async execute(id: number, dto: UpdatePropietarioDto, predioId: number): Promise<PropietarioResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) throw new NotFoundError('Propietario', id)
    const entity = await this.repo.update(id, dto)
    if (!entity) throw new NotFoundError('Propietario', id)
    return PropietarioMapper.toResponse(entity)
  }
}
