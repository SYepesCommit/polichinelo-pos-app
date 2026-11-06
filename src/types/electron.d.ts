import { Categoria, CrearPedidoInput, MetodoPago, Banco } from './pos/pos'
import { Producto } from './producto/producto.types'
import { FiltrosHistorial, MetricasVentas, VentaResumen } from './ventas/ventas.types'
import { BackupEstadoRespuesta } from './backup/backup.types'

export interface RespuestaVentasPaginada {
  datos: VentaResumen[]
  paginacion: {
    totalRegistros: number
    totalPaginas: number
    paginaActual: number
    pageSize: number
  }
  metricas: MetricasVentas
}

export interface IElectronAPI {
  // Productos y Categorías
  getCategoriasProductos: () => Promise<any[]>
  getProductos: () => Promise<Producto[]>
  getCategorias: () => Promise<Categoria[]>
  createCategoria: (nombre: string) => Promise<any>
  updateCategoria: (data: { id: number; nombre: string }) => Promise<any>
  deleteCategoria: (id: number) => Promise<any>
  getIngredientes: () => Promise<{ id: number; nombre: string }[]>
  createProducto: (dto: any) => Promise<any>
  updateProducto: (dto: any) => Promise<any>
  deleteProducto: (id: number) => Promise<any>
  seleccionarImagenProducto: () => Promise<string | null>
  uploadProductImage: (data: {
    filePath: string
    fileName: string
  }) => Promise<{ success: boolean; relativePath?: string; error?: string }>
  deleteProductImage: (relativePath: string) => Promise<{ success: boolean; error?: string }>

  // Especiales / Plato del Día
  toggleEspecialProducto: (productoId: string, esEspecial: boolean) => Promise<any>
  crearProductoEspecial: (data: {
    nombre: string
    precio: number
    categoriaId: string
    ingredientes?: string[]
  }) => Promise<any>
  desactivarProductoEspecial: (productoId: number) => Promise<any>
  getEspecialesDesactivados: () => Promise<any[]>
  eliminarProductoDefinitivo: (
    productoId: number
  ) => Promise<{ success?: boolean; error?: string } | any>

  // Clientes
  getClienteByTelefono: (telefono: string) => Promise<any>
  upsertCliente: (data: {
    nombre: string
    telefono: string
    direccion: string
    referenciaDireccion?: string
  }) => Promise<any>

  // Pedidos y Comandas
  crearPedido: (payload: CrearPedidoInput) => Promise<{ id: string; ok: boolean }>
  imprimirComanda?: (datosComanda: any) => Promise<any>

  // Métodos de Pago y Bancos
  getMetodosPago: () => Promise<MetodoPago[]>
  getBancos: () => Promise<Banco[]>
  crearBanco: (nombre: string) => Promise<Banco | null>
  eliminarBanco: (id: string) => Promise<Banco | null>

  // Ventas e Historial
  getVentasPorFecha: (fecha: string) => Promise<VentaResumen[]>
  getVentasPorRango: (fechaInicio: string, fechaFin: string) => Promise<VentaResumen[]>
  getVentasPaginadas: (filtros: FiltrosHistorial) => Promise<RespuestaVentasPaginada>
  anularVenta: (ventaId: number, motivo?: string) => Promise<any>
  desanularVenta: (ventaADesanular: number) => Promise<any>
  cambiarMetodoPagoVenta: (data: {
    pedidoId: number
    metodoPago: string
    bancoId?: string | null
  }) => Promise<{ ok: boolean }>
  exportarReporteCsv: (
    filtros: FiltrosHistorial
  ) => Promise<{ ok: boolean; filePath?: string; cancelado?: boolean; error?: string }>
  reimprimirTicket: (ventaId: number) => Promise<any>

  // Gastos y Cierre de Caja
  registrarGasto: (datos: { concepto: string; monto: number; fecha: string }) => Promise<{ success: boolean; id?: number; error?: string }>
  getGastosRango: (fechaInicio: string, fechaFin: string) => Promise<{ total: number }>
  getGastosListado: (fechaInicio: string, fechaFin: string) => Promise<Array<{ id: number; descripcion: string; monto: number; fechaRegistro: string | Date }>>
  eliminarGasto: (id: number) => Promise<{ success: boolean; error?: string }>
  imprimirCierreCaja?: (datosCierre: any) => Promise<{ success: boolean }>

  // Seguridad / PIN Supervisor
  verificarPin: (pin: string) => Promise<boolean>
  cambiarPin: (data: {
    pinActual: string
    pinNuevo: string
  }) => Promise<{ ok: boolean; error?: string }>

  // Copias de Seguridad / Backups (Drive / Local)
  getBackupEstado: () => Promise<BackupEstadoRespuesta | null>
  seleccionarCarpetaBackup: () => Promise<BackupEstadoRespuesta | null>
  cambiarAutoBackup: (activo: boolean) => Promise<BackupEstadoRespuesta | null>
  ejecutarBackupManual: () => Promise<{
    ok: boolean
    archivo?: string
    fecha?: string
    error?: string
    estado?: BackupEstadoRespuesta
  }>
  abrirCarpetaBackup: () => Promise<{ ok: boolean; error?: string }>

  // Actualizaciones automáticas (GitHub Releases)
  onUpdaterEstado?: (callback: (data: any) => void) => () => void
  comprobarActualizaciones?: () => Promise<{ ok: boolean; version?: string; error?: string }>
  reiniciarEInstalarActualizacion?: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
