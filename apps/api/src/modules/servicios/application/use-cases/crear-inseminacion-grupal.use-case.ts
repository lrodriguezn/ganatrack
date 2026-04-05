import { inject, injectable } from 'tsyringe'
import { INSEMINACION_GRUPAL_REPOSITORY } from '../../domain/repositories/inseminacion-grupal.repository.js'
import { INSEMINACION_ANIMAL_REPOSITORY } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from '../../domain/repositories/inseminacion-grupal.repository.js'
import type { IInseminacionAnimalRepository } from '../../domain/repositories/inseminacion-animal.repository.js'
import type { CreateInseminacionAnimalDto, CreateInseminacionGrupalDto, InseminacionGrupalResponseDto } from '../dtos/inseminacion.dto.js'
import { InseminacionAnimalMapper, InseminacionGrupalMapper } from '../../infrastructure/mappers/inseminacion.mapper.js'
import { ConflictError, ValidationError } from '../../../../shared/errors/index.js'
import type { ITransactionManager } from '../../../../shared/types/transaction.js'

@injectable()
export class CrearInseminacionGrupalUseCase {
  constructor(
    @inject(INSEMINACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IInseminacionGrupalRepository,
    @inject(INSEMINACION_ANIMAL_REPOSITORY) private readonly animalRepo: IInseminacionAnimalRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: CreateInseminacionGrupalDto, predioId: number): Promise<InseminacionGrupalResponseDto> {
    if (!dto.animales || dto.animales.length === 0) {
      throw new ValidationError('Debe incluir al menos un animal en la inseminación')
    }

    const existing = await this.grupalRepo.findByCodigo(dto.codigo, predioId)
    if (existing) {
      throw new ConflictError(`La inseminación con código '${dto.codigo}' ya existe en este predio`)
    }

    const result = await this.txManager.execute(async () => {
      const grupal = await this.grupalRepo.create({
        predioId,
        codigo: dto.codigo,
        fecha: new Date(dto.fecha),
        veterinariosId: dto.veterinariosId ?? null,
        observaciones: dto.observaciones ?? null,
        activo: 1,
      })

      const animalesData = dto.animales.map((a: CreateInseminacionAnimalDto) => ({
        inseminacionGrupalId: grupal.id,
        animalId: a.animalId,
        veterinarioId: a.veterinarioId ?? null,
        fecha: a.fecha ? new Date(a.fecha) : new Date(dto.fecha),
        tipoInseminacionKey: a.tipoInseminacionKey ?? null,
        codigoPajuela: a.codigoPajuela ?? null,
        diagnosticoId: a.diagnosticoId ?? null,
        observaciones: a.observaciones ?? null,
        activo: 1,
      }))

      const animales = await this.animalRepo.createMany(animalesData)

      return { ...grupal, animales }
    })

    return {
      ...InseminacionGrupalMapper.toResponse(result),
      animales: result.animales.map(InseminacionAnimalMapper.toResponse),
    }
  }
}
