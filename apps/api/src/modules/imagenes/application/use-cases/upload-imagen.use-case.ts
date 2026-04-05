import { injectable, inject } from 'tsyringe'
import { IMAGEN_REPOSITORY } from '../../domain/repositories/imagen.repository.js'
import type { IImagenRepository } from '../../domain/repositories/imagen.repository.js'
import type { UploadImagenDto, ImagenResponseDto } from '../dtos/imagen.dto.js'
import { ImagenMapper } from '../../infrastructure/mappers/imagen.mapper.js'

@injectable()
export class UploadImagenUseCase {
  constructor(
    @inject(IMAGEN_REPOSITORY) private readonly repo: IImagenRepository,
  ) {}

  async execute(dto: UploadImagenDto, predioId: number): Promise<ImagenResponseDto> {
    const entity = await this.repo.create({
      predioId,
      ruta: dto.ruta,
      nombreOriginal: dto.nombreOriginal ?? null,
      mimeType: dto.mimeType ?? null,
      tamanoBytes: dto.tamanoBytes ?? null,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return ImagenMapper.toResponse(entity)
  }
}
