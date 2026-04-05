// ConfigCalidadAnimal - Calidad del animal (Animal quality grade)
export interface ConfigCalidadAnimalEntity {
  id: number
  nombre: string
  descripcion: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
