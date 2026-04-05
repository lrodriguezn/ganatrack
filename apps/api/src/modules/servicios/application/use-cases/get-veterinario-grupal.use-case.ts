import { inject, injectable } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import { VETERINARIO_ANIMAL_REPOSITORY } from '../../domain/repositories/veterinario-animal.repository.js'
import { VETERINARIO_PRODUCTO_REPOSITORY } from '../../domain/repositories/veterinario-producto.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from '../../domain/repositories/veterinario-producto.repository.js'
import type { VeterinarioGrupalResponseDto } from '../dtos/veterinario.dto.js'
import { VeterinarioAnimalMapper, VeterinarioGrupalMapper, VeterinarioProductoMapper } from '../../infrastructure/mappers/veterinario.mapper.js'
import { NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class GetVeterinarioGrupalUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly grupalRepo: IVeterinarioGrupalRepository,
    @inject(VETERINARIO_ANIMAL_REPOSITORY) private readonly animalRepo: IVeterinarioAnimalRepository,
    @inject(VETERINARIO_PRODUCTO_REPOSITORY) private readonly productoRepo: IVeterinarioProductoRepository,
  ) {}

  async execute(id: number, predioId: number): Promise<VeterinarioGrupalResponseDto> {
    const grupal = await this.grupalRepo.findById(id, predioId)
    if (!grupal) {
      throw new NotFoundError('VeterinarioGrupal', id)
    }

    const animales = await this.animalRepo.findByGrupalId(id)

    const animalesConProductos = await Promise.all(
      animales.map(async (a) => {
        const productos = await this.productoRepo.findByAnimalId(a.id)
        return {
          ...VeterinarioAnimalMapper.toResponse(a),
          productos: productos.map(VeterinarioProductoMapper.toResponse),
        }
      })
    )

    return {
      ...VeterinarioGrupalMapper.toResponse(grupal),
      animales: animalesConProductos,
    }
  }
}
