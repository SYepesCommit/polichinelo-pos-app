import {
  TipoPedido,
} from './pos'

export interface DetalleItemComanda {
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  observaciones?: string
  adiciones?: string[]
}

export interface DatosComandaCocina {
  consecutivo: string | number
  fecha: string
  tipoPedido: TipoPedido
  mesa?: string | number
  cliente?: {
    nombre: string
    telefono: string
    direccion?: string
    referenciaDireccion?: string
  }
  items: DetalleItemComanda[]
  subtotal: number
  costoDomicilio?: number
  total: number
  metodoPago?: string
  observacionesGenerales?: string
  hora?: string
  detallesDestino?: string
  bancoNombre?: string
  montoRecibido?: number
  cambio?: number
  pagos?: Array<{
    metodoPago: string
    monto: number
    bancoNombre?: string | null
  }>
}

export interface FormEspecialData {
  nombre: string
  precio: number
  categoriaId: string
  ingredientes?: string[]
}