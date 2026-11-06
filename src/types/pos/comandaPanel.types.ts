import React from 'react'
import { ItemCarrito, TipoPedido, MetodoPago, Banco, Producto } from './pos'

export interface ComandaPanelProps {
  carrito: ItemCarrito[]
  tipoPedido: TipoPedido
  nombreCliente: string
  telefono?: string
  direccionCliente?: string
  referenciaCliente?: string
  montoDomicilio?: number
  setMontoDomicilio?: (monto: number) => void
  metodosPago: MetodoPago[]
  metodoPagoSeleccionado: MetodoPago | null
  setMetodoPagoSeleccionado: (mp: MetodoPago) => void
  bancos: Banco[]
  bancoSeleccionado: string
  setBancoSeleccionado: (id: string) => void
  total: number
  onCambiarCantidad: (idTemp: string, delta: number) => void
  onEliminarItem: (idTemp: string) => void
  onEditarItem: (item: ItemCarrito) => void
  onAgregarItemLibre?: (nombre: string, precio: number) => void
  onVaciarCarrito?: () => void
  cobrando?: boolean
  onCobrar: () => void
  onActualizarBancos?: () => void
}

export interface ItemLibreFormState {
  nombre: string
  precio: string
}

export interface ItemLibreModalProps {
  nombreItemLibre: string
  setNombreItemLibre: (v: string) => void
  precioItemLibre: string
  setPrecioItemLibre: (v: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export interface ProductGridProps {
  productos: Producto[]
  categoriaActiva: string | null
  onAgregarRapido: (producto: Producto) => void
  onAbrirPersonalizacion: (producto: Producto) => void
  onAbrirNuevoEspecial?: () => void
}
