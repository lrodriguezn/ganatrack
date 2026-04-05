import type { AnimalImagenEntity } from '../entities/animal.entity.js'

export interface IAnimalImagenRepository {
  findByAnimal(animalId: number): Promise<AnimalImagenEntity[]>
  findByImagen(imagenId: number): Promise<AnimalImagenEntity[]>
  create(data: { animalId: number; imagenId: number }): Promise<AnimalImagenEntity>
  delete(animalId: number, imagenId: number): Promise<boolean>
}

export const ANIMAL_IMAGEN_REPOSITORY = Symbol('IAnimalImagenRepository')
