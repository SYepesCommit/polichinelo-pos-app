export interface DetalleItemComanda {
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  observaciones?: string
  adiciones?: string[]
}