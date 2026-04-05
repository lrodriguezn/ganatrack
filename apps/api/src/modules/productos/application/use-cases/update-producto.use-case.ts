import { injectable, inject } from 'tsyringe'
import { PRODUCTO_REPOSITORY } from '../../domain/repositories/producto.repository.js'
import type { IProductoRepository } from '../../domain/repositories/producto.repository.js'
import type { UpdateProductoDto, ProductoResponseDto } from '../dtos/producto.dto.js'
import { ProductoMapper } from '../../infrastructure/mappers/producto.mapper.js'
import { NotFoundError, ConflictError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateProductoUseCase {
  constructor(
    @inject(PRODUCTO_REPOSITORY) private readonly repo: IProductoRepository,
  ) {}

  async execute(id: number, dto: UpdateProductoDto, predioId: number): Promise<ProductoResponseDto> {
    const existing = await this.repo.findById(id, predioId)
    if (!existing) {
      throw new NotFoundError('Producto', id)
    }

    const updateData: Partial<typeof existing> = { updatedAt: new Date() }
    if (dto.nombre !== undefined) updateData.nombre = dto.nombre
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion
    if (dto.tipoProducto !== undefined) updateData.tipoProducto = dto.tipoProducto
    if (dto.categoria !== undefined) updateData.categoria = dto.categoria
    if (dto.presentacion !== undefined) updateData.presentacion = dto.presentacion
    if (dto.unidadMedida !== undefined) updateData.unidadMedida = dto.unidadMedida
    if (dto.precioUnitario !== undefined) updateData.precioUnitario = dto.precioUnitario
    if (dto.stockMinimo !== undefined) updateData.stockMinimo = dto.stockMinimo
    if (dto.stockActual !== undefined) updateData.stockActual = dto.stockActual
    if (dto.fechaVencimiento !== undefined) updateData.fechaVencimiento = dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : null
    if (dto.laboratorio !== undefined) updateData.laboratorio = dto.laboratorio
    if (dto.registroInvima !== undefined) updateData.registroInvima = dto.registroInvima

    const updated = await this.repo.update(id, updateData as any)
    if (!updated) {
      throw new NotFoundError('Producto', id)
    }

    return ProductoMapper.toResponse(updated)
  }
}
