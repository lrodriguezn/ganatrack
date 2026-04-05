import { injectable, inject } from 'tsyringe'
import { VETERINARIO_GRUPAL_REPOSITORY } from '../../domain/repositories/veterinario-grupal.repository.js'
import { VETERINARIO_ANIMAL_REPOSITORY } from '../../domain/repositories/veterinario-animal.repository.js'
import { VETERINARIO_PRODUCTO_REPOSITORY } from '../../domain/repositories/veterinario-producto.repository.js'
import type { IVeterinarioGrupalRepository } from '../../domain/repositories/veterinario-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioProductoRepository } from '../../domain/repositories/veterinario-producto.repository.js'
import type { CreateVeterinarioGrupalDto, VeterinarioGrupalResponseDto, CreateVeterinarioAnimalDto } from '../dtos/veterinario.dto.js'
import { VeterinarioGrupalMapper, VeterinarioAnimalMapper, VeterinarioProductoMapper } from '../../infrastructure/mappers/veterinario.mapper.js'
import { ConflictError, ValidationError } from '../../../../shared/errors/index.js'
import type { ITransactionManager } from '../../../../shared/types/transaction.js'

@injectable()
export class CrearVeterinarioGrupalUseCase {
  constructor(
    @inject(VETERINARIO_GRUPAL_REPOSITORY) private readonly grupalRepo: IVeterinarioGrupalRepository,
    @inject(VETERINARIO_ANIMAL_REPOSITORY) private readonly animalRepo: IVeterinarioAnimalRepository,
    @inject(VETERINARIO_PRODUCTO_REPOSITORY) private readonly productoRepo: IVeterinarioProductoRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: CreateVeterinarioGrupalDto, predioId: number): Promise<VeterinarioGrupalResponseDto> {
    if (!dto.animales || dto.animales.length === 0) {
      throw new ValidationError('Debe incluir al menos un animal en el servicio veterinario')
    }

    const existing = await this.grupalRepo.findByCodigo(dto.codigo, predioId)
    if (existing) {
      throw new ConflictError(`El servicio veterinario con código '${dto.codigo}' ya existe en este predio`)
    }

    const result = await this.txManager.execute(async () => {
      const grupal = await this.grupalRepo.create({
        predioId,
        codigo: dto.codigo,
        fecha: new Date(dto.fecha),
        veterinariosId: dto.veterinariosId ?? null,
        tipoServicio: dto.tipoServicio ?? null,
        observaciones: dto.observaciones ?? null,
        activo: 1,
      })

      const animalesData = dto.animales.map((a: CreateVeterinarioAnimalDto) => ({
        servicioGrupalId: grupal.id,
        animalId: a.animalId,
        veterinarioId: a.veterinarioId ?? null,
        diagnosticoId: a.diagnosticoId ?? null,
        fecha: a.fecha ? new Date(a.fecha) : new Date(dto.fecha),
        tipoDiagnosticoKey: a.tipoDiagnosticoKey ?? null,
        tratamiento: a.tratamiento ?? null,
        medicamentos: a.medicamentos ?? null,
        dosis: a.dosis ?? null,
        comentarios: a.comentarios ?? null,
        activo: 1,
      }))

      const animales = await this.animalRepo.createMany(animalesData)

      // Create product records for each animal
      const productosData: any[] = []
      for (let i = 0; i < animales.length; i++) {
        const animal = dto.animales[i]
        if (animal.productos && animal.productos.length > 0) {
          for (const p of animal.productos) {
            productosData.push({
              servicioAnimalId: animales[i].id,
              productoId: p.productoId,
              cantidad: p.cantidad ?? null,
              unidad: p.unidad ?? null,
              activo: 1,
            })
          }
        }
      }

      const productos = await this.productoRepo.createMany(productosData)

      return { grupal, animales, productos }
    })

    const animalesConProductos = result.animales.map((a, i) => {
      const animalDto = dto.animales[i]
      const productosAnimal = result.productos.filter((p: any) => p.servicioAnimalId === a.id)
      return {
        ...VeterinarioAnimalMapper.toResponse(a),
        productos: productosAnimal.map(VeterinarioProductoMapper.toResponse),
      }
    })

    return {
      ...VeterinarioGrupalMapper.toResponse(result.grupal),
      animales: animalesConProductos,
    }
  }
}
