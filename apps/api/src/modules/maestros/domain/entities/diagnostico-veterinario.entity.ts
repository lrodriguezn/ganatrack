// DiagnosticoVeterinario - Veterinary diagnosis (global)
export interface DiagnosticoVeterinarioEntity {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
