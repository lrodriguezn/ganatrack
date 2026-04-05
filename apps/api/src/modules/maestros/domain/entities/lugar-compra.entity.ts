// LugarCompra - Purchase place (global)
export interface LugarCompraEntity {
  id: number
  nombre: string
  tipo: string | null
  ubicacion: string | null
  contacto: string | null
  telefono: string | null
  activo: number
  createdAt: Date | null
  updatedAt: Date | null
}
