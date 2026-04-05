import { inject, injectable } from 'tsyringe'
import { PRODUCTO_REPOSITORY } from '../../domain/repositories/producto.repository.js'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import type { CreateProductoDto, ProductoResponseDto } from '../dtos/producto.dto.js'
import { ProductoMapper } from '../../infrastructure/mappers/producto.mapper.js'
import { ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class CrearProductoUseCase {
  constructor(
    @inject(PRODUCTO_REPOSITORY) private readonly repo: IProductoRepository,
  ) {}

  async execute(dto: CreateProductoDto, predioId: number): Promise<ProductoResponseDto> {
    // Check duplicate codigo
    const existing = await this.repo.findByCodigo(dto.codigo, predioId)
    if (existing) {
      throw new ConflictError(`El producto con código '${dto.codigo}' ya existe en este predio`)
    }

    const entity = await this.repo.create({
      predioId,
      codigo: dto.codigo,
      nombre: dto.nombre ?? null,
      descripcion: dto.descripcion ?? null,
      tipoProducto: dto.tipoProducto ?? null,
      categoria: dto.categoria ?? null,
      presentacion: dto.presentacion ?? null,
      unidadMedida: dto.unidadMedida ?? null,
      precioUnitario: dto.precioUnitario ?? null,
      stockMinimo: dto.stockMinimo ?? null,
      stockActual: dto.stockActual ?? null,
      fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null,
      laboratorio: dto.laboratorio ?? null,
      registroInvima: dto.registroInvima ?? null,
      activo: 1,
    })

    return ProductoMapper.toResponse(entity)
  }
}
