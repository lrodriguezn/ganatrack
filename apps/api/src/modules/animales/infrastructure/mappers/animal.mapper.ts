import type { AnimalEntity, ImagenEntity } from '../../domain/entities/animal.entity.js'
import type { AnimalResponseDto, ImagenResponseDto } from '../../application/dtos/animal.dto.js'

export class AnimalMapper {
  static toResponse(e: AnimalEntity): AnimalResponseDto {
    return {
      id: e.id, predioId: e.predioId, codigo: e.codigo, nombre: e.nombre ?? '',
      fechaNacimiento: e.fechaNacimiento?.toISOString() ?? null,
      fechaCompra: e.fechaCompra?.toISOString() ?? null,
      sexoKey: e.sexoKey, tipoIngresoId: e.tipoIngresoId, madreId: e.madreId,
      codigoMadre: e.codigoMadre ?? null, indTransferenciaEmb: e.indTransferenciaEmb,
      codigoDonadora: e.codigoDonadora ?? null, tipoPadreKey: e.tipoPadreKey,
      padreId: e.padreId, codigoPadre: e.codigoPadre ?? null,
      codigoPajuela: e.codigoPajuela ?? null, configRazasId: e.configRazasId,
      potreroId: e.potreroId, precioCompra: e.precioCompra, pesoCompra: e.pesoCompra,
      codigoRfid: e.codigoRfid ?? null, codigoArete: e.codigoArete ?? null,
      codigoQr: e.codigoQr ?? null, saludAnimalKey: e.saludAnimalKey,
      estadoAnimalKey: e.estadoAnimalKey, indDescartado: e.indDescartado,
      activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null,
      updatedAt: e.updatedAt?.toISOString() ?? null,
    }
  }
}

export class ImagenMapper {
  static toResponse(e: ImagenEntity): ImagenResponseDto {
    return {
      id: e.id, predioId: e.predioId, ruta: e.ruta, nombreOriginal: e.nombreOriginal,
      mimeType: e.mimeType, tamanoBytes: e.tamanoBytes, descripcion: e.descripcion,
      activo: e.activo, createdAt: e.createdAt?.toISOString() ?? null,
    }
  }
}
