import { inject, injectable } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { CreateImagenDto, ImagenResponseDto } from '../dtos/animal.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/animal.mapper.js'

@injectable()
export class CrearImagenUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(dto: CreateImagenDto, predioId: number): Promise<ImagenResponseDto> {
    const entity = await this.repo.create({
      predioId: predioId,
      ruta: dto.ruta,
      nombreOriginal: dto.nombreOriginal ?? null,
      mimeType: dto.mimeType ?? null,
      tamanoBytes: dto.tamanoBytes ?? null,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    } as any)

    return ImagenMapper.toResponse(entity)
  }
}
