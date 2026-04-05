import { injectable, inject } from 'tsyringe'
import { HIERRO_REPOSITORY } from '../../domain/repositories/hierro.repository.js'
import type { IHierroRepository } from '../../domain/repositories/hierro.repository.js'
import type { CreateHierroDto, HierroResponseDto } from '../dtos/maestros.dto.js'
import { HierroMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearHierroUseCase {
  constructor(@inject(HIERRO_REPOSITORY) private readonly repo: IHierroRepository) {}
  async execute(dto: CreateHierroDto, predioId: number): Promise<HierroResponseDto> {
    const entity = await this.repo.create({ ...dto, predioId, descripcion: dto.descripcion ?? null, activo: 1 })
    return HierroMapper.toResponse(entity)
  }
}
