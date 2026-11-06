import React from 'react'
import { TipoPedido, Banco, MetodoPago } from '../../types/pos/pos'

export type ModoFiltroFecha = 'UNICA' | 'RANGO'

export type FiltroEstadoVenta = 'TODOS' | 'REALIZADOS' | 'ANULADOS'

export interface VentaItemDetalle {
  id: number
  productoId?: number | null
  nombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  observaciones?: string | null
  producto?: {
    id: number
    nombre: string
  }
}

export interface VentaClienteDetalle {
  nombre: string
  telefono: string
  direccion: string
  referenciaDireccion?: string
}

export interface VentaResumen {
  id: number
  consecutivo: string
  fecha: string // YYYY-MM-DD
  hora: string  // HH:mm
  tipoPedido: TipoPedido
  nombreCliente?: string
  cliente?: VentaClienteDetalle
  montoTotal: number
  montoDomicilio?: number
  detallesDestino?: string | null
  observacionesGenerales?: string | null
  metodoPago: string
  bancoId?: string | null
  bancoNombre?: string | null
  items: VentaItemDetalle[]
  estado: 'COMPLETADO' | 'REALIZADO' | 'ANULADO'
  motivoAnulacion?: string | null
}

export interface VentasFiltros {
  modoFecha: ModoFiltroFecha
  fechaUnica: string
  fechaInicio: string
  fechaFin: string
  busqueda: string
  tipoPedido?: string
  estado?: string
  bancoId?: string
}

export interface FiltrosHistorial {
  fechaInicio: string
  fechaFin: string
  busqueda?: string
  tipoPedido?: string
  estado?: string
  bancoId?: string
  page?: number
  pageSize?: number
}

export interface ProductoMasVendido {
  productoId: number | null
  nombre: string
  categoriaNombre: string
  cantidadVendida: number
  totalGenerado: number
  gananciaEstimada: number
}

export interface DesgloseBancoItem {
  bancoId: string
  nombre: string
  totalMonto: number
  cantidadPedidos: number
}

export interface MetricasVentas {
  totalMonto: number
  totalEfectivo: number
  totalBancos: number
  totalPedidos: number
  mesas: number
  llevar: number
  domicilios: number
  totalDomiciliosMonto?: number
  totalUnidadesVendidas?: number
  rankingProductos?: ProductoMasVendido[]
  desgloseBancos?: DesgloseBancoItem[]
}

export interface VentasHeaderProps {
  modoFecha: string
  setModoFecha: (modo: any) => void
  fechaUnica: string
  setFechaUnica: (f: string) => void
  fechaInicio: string
  setFechaInicio: (f: string) => void
  fechaFin: string
  setFechaFin: (f: string) => void
  cargando: boolean
  exportandoCsv?: boolean
  handleIrAHoy: () => void
  handleIrAAyer: () => void
  handleIrAEstaSemana: () => void
  handleIrAEsteMes: () => void
  recargarVentas: () => void
  setModalGastoAbierto: (v: boolean) => void
  handleExportarCsv: () => void
}

export interface VentasMetricsProps {
  metricas: MetricasVentas
  totalGastos: number
  efectivoEsperado: number
  formatMoneda: (monto: number) => string
  handleAbrirDetalleGastos: () => void
  handleAbrirRankingProductos: () => void
  handleAbrirDesgloseBancos: () => void
}

export interface RankingProductosModalProps {
  abierto: boolean
  onCerrar: () => void
  rankingProductos: ProductoMasVendido[]
  totalUnidadesVendidas: number
  formatMoneda: (monto: number) => string
}

export interface DesgloseBancosModalProps {
  abierto: boolean
  onCerrar: () => void
  desgloseBancos: DesgloseBancoItem[]
  totalBancos: number
  bancoFiltroActual: string
  onSeleccionarBancoFiltro: (bancoId: string) => void
  formatMoneda: (monto: number) => string
}

export interface CambiarMetodoPagoModalProps {
  venta: VentaResumen | null
  metodosPago: MetodoPago[]
  bancos: Banco[]
  onCerrar: () => void
  onConfirmarCambio: (data: {
    pedidoId: number
    metodoPago: string
    bancoId?: string | null
  }) => Promise<void>
  formatMoneda: (monto: number) => string
}

export interface VentasFiltersProps {
  busqueda: string
  setBusqueda: (v: string) => void
  filtroEstadoVenta: string
  setFiltroEstadoVenta: (v: any) => void
  tipoPedidoFiltro: string
  setTipoPedidoFiltro: (v: string) => void
  bancoFiltro?: string
  nombreBancoFiltro?: string
  onLimpiarBancoFiltro?: () => void
}

export interface GastosCajaModalsProps {
  modalGastoAbierto: boolean
  setModalGastoAbierto: (v: boolean) => void
  conceptoGasto: string
  setConceptoGasto: (v: string) => void
  montoGasto: string
  setMontoGasto: (v: string) => void
  handleGuardarGasto: (e: React.FormEvent) => void
  guardandoGasto: boolean
  modalDetalleGastosAbierto: boolean
  setModalDetalleGastosAbierto: (v: boolean) => void
  listaGastos: any[]
  cargandoGastos: boolean
  handleEliminarGasto: (id: number) => void
  formatMoneda: (monto: number) => string
  totalGastos: number
}

export interface AnulacionVentaModalsProps {
  ventaAAnular: any
  setVentaAAnular: (v: any) => void
  motivoAnulacion: string
  setMotivoAnulacion: (v: string) => void
  otroMotivo: string
  setOtroMotivo: (v: string) => void
  handleConfirmarAnulacion: () => void
  ventaADesanular: any
  setVentaADesanular: (v: any) => void
  handleConfirmarDesanulacion: () => void
  formatMoneda: (monto: number) => string
}

export interface VentasModalsProps extends GastosCajaModalsProps, AnulacionVentaModalsProps {}

export interface VentasListProps {
  cargando: boolean
  ventasFiltradas: VentaResumen[]
  modoFecha: string
  ventaExpandidaId: number | null
  toggleExpandir: (id: number) => void
  handleReimprimir: (v: VentaResumen) => void
  setVentaADesanular: (v: VentaResumen) => void
  handleAbrirAnulacion: (v: VentaResumen) => void
  handleAbrirCambiarPago: (v: VentaResumen) => void
  formatMoneda: (monto: number) => string
}

export interface VentasPaginationProps {
  cantidadMostrando: number
  totalRegistros: number
  paginaActual: number
  totalPaginas: number
  cargando: boolean
  setPaginaActual: (page: number | ((prev: number) => number)) => void
}
