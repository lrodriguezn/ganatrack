import type { ProductoEntity, ProductoImagenEntity } from '../../domain/entities/producto.entity.js'
import type { ProductoResponseDto, ProductoImagenResponseDto } from '../../application/dtos/producto.dto.js'

export class ProductoMapper {
  static toResponse(e: ProductoEntity): ProductoResponseDto {
    return {
      id: e.id,
      predioId: e.predioId,
      codigo: e.codigo,
      nombre: e.nombre,
      descripcion: e.descripcion,
      tipoProducto: e.tipoProducto,
      categoria: e.categoria,
      presentacion: e.presentacion,
      unidadMedida: e.unidadMedida,
      precioUnitario: e.precioUnitario,
      stockMinimo: e.stockMinimo,
      stockActual: e.stockActual,
      fechaVencimiento: e.fechaVencimiento?.toISOString() ?? null,
      laboratorio: e.laboratorio,
      registroInvima: e.registroInvima,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ProductoImagenMapper {
  static toResponse(e: ProductoImagenEntity): ProductoImagenResponseDto {
    return {
      id: e.id,
      productoId: e.productoId,
      imagenId: e.imagenId,
      activo: e.activo,
      createdAt: e.createdAt?.toISOString() ?? null,
    }
  }
}
