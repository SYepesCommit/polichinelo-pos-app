export type TipoPedido = 'MESA' | 'LLEVAR' | 'DOMICILIO'

// Entidades de Métodos de Pago y Bancos desde la Base de Datos
export interface MetodoPago {
  id: string
  nombre: string
  codigo: string
  requiereBanco: boolean
  activo: boolean
}

export interface Banco {
  id: string
  nombre: string
  activo: boolean
}

export interface Producto {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  precioBase: number
  activo?: boolean
  imagenUrl?: string
  esEspecial?: boolean
  categoriaId?: string
  ingredientes?: string[]
}

export interface Categoria {
  id: string
  nombre: string
  orden?: number
  productos: Producto[]
}

export interface Cliente {
  id: string
  telefono: string
  nombre: string
  direccion: string
  referenciaDireccion?: string
}

// Payload de Pagos dinámicos
export interface PagoInput {
  metodoPagoId?: string
  metodoPago: string // Soporta la clave/código o nombre dinámico enviado desde la BD
  bancoId?: string
  monto: number
  referencia?: string
}

export interface DetallePedidoInput {
  productoId: string
  cantidad: number
  precioUnitario: number
  observaciones?: string
}

export interface CrearPedidoInput {
  tipoPedido: TipoPedido
  detallesDestino?: string
  clienteData?: {
    telefono: string
    nombre: string
    direccion: string
    referenciaDireccion?: string
  }
  detalles: DetallePedidoInput[]
  pagos: PagoInput[]
  total: number
}

export interface ItemCarrito {
  idTemp: string
  producto: Producto
  cantidad: number
  observaciones: string
}

export interface ProductGridProps {
  productos: Producto[]
  categoriaActiva: string | null
  onAgregarRapido: (producto: Producto) => void
  onAbrirPersonalizacion: (producto: Producto) => void
  onAbrirNuevoEspecial?: () => void
}