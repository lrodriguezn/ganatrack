/**
 * Enums for GanaTrack shared types.
 * Values match the `config_key_values` seed data from the backend:
 * opcion='sexo': Masculino=0, Femenino=1
 * opcion='estado_animal': Activo=0, Vendido=1, Muerto=2
 * opcion='tipo_ingreso' (OrigenAnimal): NacidoPredio=0, Comprado=1
 *
 * These numeric enums align with the integer _key columns in the DB schema.
 */

export enum SexoEnum {
  MASCULINO = 0,
  FEMENINO = 1,
}

export enum EstadoAnimalEnum {
  ACTIVO = 0,
  VENDIDO = 1,
  MUERTO = 2,
}

export enum OrigenAnimalEnum {
  NACIDO_PREDIO = 0,
  COMPRADO = 1,
}
