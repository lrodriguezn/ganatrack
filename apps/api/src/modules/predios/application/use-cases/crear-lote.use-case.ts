import { inject, injectable } from 'tsyringe'
import { LOTE_REPOSITORY } from '../../domain/repositories/lote.repository.js'
import type { ILoteRepository } from '../../domain/repositories/lote.repository.js'
import type { CreateLoteDto, LoteResponseDto } from '../dtos/predios.dto.js'
import { LoteMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class CrearLoteUseCase {
  constructor(
    @inject(LOTE_REPOSITORY) private readonly repo: ILoteRepository,
  ) {}

  async execute(dto: CreateLoteDto, predioId: number): Promise<LoteResponseDto> {
    const entity = await this.repo.create({
      predioId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      tipo: dto.tipo ?? null,
      activo: 1,
    })

    return LoteMapper.toResponse(entity)
  }
}
