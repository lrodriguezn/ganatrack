import { injectable, inject } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import { VETERINARIO_ANIMAL_REPOSITORY } from '../../domain/repositories/veterinario-animal.repository.js'
import { VETERINARIO_PRODUCTO_REPOSITORY } from '../../domain/repositories/veterinario-producto.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from '../../domain/repositories/veterinario-producto.repository.js'
import type { CreateVeterinarioAnimalDto, VeterinarioAnimalResponseDto, CreateVeterinarioProductoDto } from '../dtos/veterinario.dto.js'
import { VeterinarioAnimalMapper, VeterinarioProductoMapper } from '../../infrastructure/mappers/veterinario.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class AddVeterinarioAnimalUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly grupalRepo: IVeterinarioGrupalRepository,
    @inject(VETERINARIO_ANIMAL_REPOSITORY) private readonly repo: IVeterinarioAnimalRepository,
    @inject(VETERINARIO_PRODUCTO_REPOSITORY) private readonly productoRepo: IVeterinarioProductoRepository,
  ) {}

  async execute(grupalId: number, dto: CreateVeterinarioAnimalDto, predioId: number): Promise<VeterinarioAnimalResponseDto> {
    const grupal = await this.grupalRepo.findById(grupalId, predioId)
    if (!grupal) {
      throw new NotFoundError('VeterinarioGrupal', grupalId)
    }

    const animal = await this.repo.create({
      servicioGrupalId: grupalId,
      animalId: dto.animalId,
      veterinarioId: dto.veterinarioId ?? null,
      diagnosticoId: dto.diagnosticoId ?? null,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      tipoDiagnosticoKey: dto.tipoDiagnosticoKey ?? null,
      tratamiento: dto.tratamiento ?? null,
      medicamentos: dto.medicamentos ?? null,
      dosis: dto.dosis ?? null,
      comentarios: dto.comentarios ?? null,
      activo: 1,
    })

    // Create product records
    const productosData = (dto.productos || []).map((p: CreateVeterinarioProductoDto) => ({
      servicioAnimalId: animal.id,
      productoId: p.productoId,
      cantidad: p.cantidad ?? null,
      unidad: p.unidad ?? null,
      activo: 1,
    }))

    const productos = await this.productoRepo.createMany(productosData)

    return {
      ...VeterinarioAnimalMapper.toResponse(animal),
      productos: productos.map(VeterinarioProductoMapper.toResponse),
    }
  }
}
