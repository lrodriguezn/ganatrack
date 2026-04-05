import { inject, injectable } from 'tsyringe'
import { CAUSA_MUERTE_REPOSITORY } from '../../domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from '../../domain/repositories/causa-muerte.repository.js'
import type { CausaMuerteResponseDto, CreateCausaMuerteDto } from '../dtos/maestros.dto.js'
import { CausaMuerteMapper } from '../../infrastructure/mappers/maestros.mapper.js'

@injectable()
export class CrearCausaMuerteUseCase {
  constructor(@inject(CAUSA_MUERTE_REPOSITORY) private readonly repo: ICausaMuerteRepository) {}
  async execute(dto: CreateCausaMuerteDto): Promise<CausaMuerteResponseDto> {
    const entity = await this.repo.create({ nombre: dto.nombre, descripcion: dto.descripcion ?? null, activo: 1 })
    return CausaMuerteMapper.toResponse(entity)
  }
}
