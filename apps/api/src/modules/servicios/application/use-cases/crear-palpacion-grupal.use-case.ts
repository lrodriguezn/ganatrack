import { injectable, inject } from 'tsyringe'
import { PALPACION_GRUPAL_REPOSITORY } from '../../domain/repositories/palpacion-grupal.repository.js'
import { PALPACION_ANIMAL_REPOSITORY } from '../../domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionGrupalRepository } from '../../domain/repositories/palpacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from '../../domain/repositories/palpacion-animal.repository.js'
import type { CreatePalpacionGrupalDto, PalpacionGrupalResponseDto, CreatePalpacionAnimalDto } from '../dtos/palpacion.dto.js'
import { PalpacionGrupalMapper, PalpacionAnimalMapper } from '../../infrastructure/mappers/palpacion.mapper.js'
import { ConflictError, ValidationError } from '../../../../shared/errors/index.js'
import type { ITransactionManager } from '../../../../shared/types/transaction.js'

@injectable()
export class CrearPalpacionGrupalUseCase {
  constructor(
    @inject(PALPACION_GRUPAL_REPOSITORY) private readonly grupalRepo: IPalpacionGrupalRepository,
    @inject(PALPACION_ANIMAL_REPOSITORY) private readonly animalRepo: IPalpacionAnimalRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: CreatePalpacionGrupalDto, predioId: number): Promise<PalpacionGrupalResponseDto> {
    // Validate at least one animal
    if (!dto.animales || dto.animales.length === 0) {
      throw new ValidationError('Debe incluir al menos un animal en la palpación')
    }

    // Check duplicate codigo
    const existing = await this.grupalRepo.findByCodigo(dto.codigo, predioId)
    if (existing) {
      throw new ConflictError(`La palpación con código '${dto.codigo}' ya existe en este predio`)
    }

    // Execute in transaction
    const result = await this.txManager.execute(async (tx) => {
      // Create grupal
      const grupal = await this.grupalRepo.create({
        predioId,
        codigo: dto.codigo,
        fecha: new Date(dto.fecha),
        veterinariosId: dto.veterinariosId ?? null,
        observaciones: dto.observaciones ?? null,
        activo: 1,
      })

      // Create animal records
      const animalesData = dto.animales.map((a: CreatePalpacionAnimalDto) => ({
        palpacionGrupalId: grupal.id,
        animalId: a.animalId,
        veterinarioId: a.veterinarioId ?? null,
        diagnosticoId: a.diagnosticoId ?? null,
        condicionCorporalId: a.condicionCorporalId ?? null,
        fecha: a.fecha ? new Date(a.fecha) : new Date(dto.fecha),
        diasGestacion: a.diasGestacion ?? null,
        fechaParto: a.fechaParto ? new Date(a.fechaParto) : null,
        comentarios: a.comentarios ?? null,
        activo: 1,
      }))

      const animales = await this.animalRepo.createMany(animalesData)

      return {
        ...grupal,
        animales,
      }
    })

    return {
      ...PalpacionGrupalMapper.toResponse(result),
      animales: result.animales.map(PalpacionAnimalMapper.toResponse),
    }
  }
}
