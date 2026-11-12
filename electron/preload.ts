import { contextBridge, ipcRenderer } from 'electron'

// Exponemos las funciones necesarias directamente en window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  getCategoriasProductos: () => ipcRenderer.invoke('get-categorias-productos'),
  getClienteByTelefono: (telefono: string) => ipcRenderer.invoke('get-cliente-by-telefono', telefono),
  crearPedido: (payload: any) => ipcRenderer.invoke('crear-pedido', payload),
  getMetodosPago: () => ipcRenderer.invoke('get-metodos-pago'),
  getBancos: () => ipcRenderer.invoke('get-bancos'),
  crearBanco: (nombre: string) => ipcRenderer.invoke('crear-banco', nombre),
  eliminarBanco: (id: string) => ipcRenderer.invoke('eliminar-banco', id),
  upsertCliente: (data: { nombre: string; telefono: string; direccion: string; referenciaDireccion?: string }) => ipcRenderer.invoke('upsert-cliente', data),
  toggleEspecialProducto: (productoId: string, esEspecial: boolean) => ipcRenderer.invoke('toggle-especial-producto', productoId, esEspecial),
  crearProductoEspecial: (data: {
    nombre: string
    precio: number
    categoriaId: string
    ingredientes?: string[]
  }) => ipcRenderer.invoke('crear-producto-especial', data),
  desactivarProductoEspecial: (productoId: number) =>
    ipcRenderer.invoke('desactivar-producto-especial', productoId),

  getEspecialesDesactivados: () =>
    ipcRenderer.invoke('get-especiales-desactivados'),

  eliminarProductoDefinitivo: (productoId: number) =>
    ipcRenderer.invoke('eliminar-producto-definitivo', productoId),
  uploadProductImage: (data: { filePath: string; fileName: string }) =>
    ipcRenderer.invoke('upload-product-image', data),
  deleteProductImage: (relativePath: string) =>
    ipcRenderer.invoke('delete-product-image', relativePath),
  getVentasPorFecha: (fecha: string) => 
    ipcRenderer.invoke('getVentasPorFecha', fecha),
    
  getVentasPorRango: (fechaInicio: string, fechaFin: string) =>
    ipcRenderer.invoke('getVentasPorRango', fechaInicio, fechaFin),
    
  anularVenta: (ventaId: number, motivo?: string) => 
    ipcRenderer.invoke('anularVenta', ventaId, motivo),
    
  reimprimirTicket: (ventaId: number) => 
    ipcRenderer.invoke('reimprimirTicket', ventaId),
  imprimirComanda: (datosComanda: any) =>
    ipcRenderer.invoke('imprimir-comanda', datosComanda),
  desanularVenta: (id: number) => ipcRenderer.invoke('desanular-venta', id),
  getVentasPaginadas: (filtros: any) => ipcRenderer.invoke('get-ventas-paginadas', filtros),
  cambiarMetodoPagoVenta: (data: {
    pedidoId: number
    metodoPago: string
    bancoId?: string | null
    esMixto?: boolean
    montoEfectivo?: number
    montoTransferencia?: number
  }) => ipcRenderer.invoke('cambiar-metodo-pago-venta', data),
  exportarReporteCsv: (filtros: any) => ipcRenderer.invoke('exportar-reporte-csv', filtros),
  getProductos: () => ipcRenderer.invoke('get-productos'),
  getCategorias: () => ipcRenderer.invoke('get-categorias'),
  createCategoria: (nombre: string) => ipcRenderer.invoke('create-categoria', nombre),
  updateCategoria: (data: { id: number; nombre: string }) => ipcRenderer.invoke('update-categoria', data),
  deleteCategoria: (id: number) => ipcRenderer.invoke('delete-categoria', id),
  getIngredientes: () => ipcRenderer.invoke('get-ingredientes'),
  createProducto: (dto: any) => ipcRenderer.invoke('create-producto', dto),
  updateProducto: (dto: any) => ipcRenderer.invoke('update-producto', dto),
  deleteProducto: (id: number) => ipcRenderer.invoke('delete-producto', id),
  seleccionarImagenProducto: () => ipcRenderer.invoke('seleccionar-imagen-producto'),

  registrarGasto: (datos: any) => ipcRenderer.invoke('registrarGasto', datos),
  getGastosRango: (fechaInicio: string, fechaFin: string) => ipcRenderer.invoke('getGastosRango', fechaInicio, fechaFin),  
  getGastosListado: (fechaInicio: string, fechaFin: string) => ipcRenderer.invoke('getGastosListado', fechaInicio, fechaFin),
  eliminarGasto: (id: number) => ipcRenderer.invoke('eliminarGasto', id),

  // Seguridad / PIN Supervisor
  verificarPin: (pin: string) => ipcRenderer.invoke('verificar-pin', pin),
  cambiarPin: (data: { pinActual: string; pinNuevo: string }) =>
    ipcRenderer.invoke('cambiar-pin', data),

  // Copias de Seguridad / Backups (Drive / Local)
  getBackupEstado: () => ipcRenderer.invoke('get-backup-estado'),
  seleccionarCarpetaBackup: () => ipcRenderer.invoke('seleccionar-carpeta-backup'),
  cambiarAutoBackup: (activo: boolean) => ipcRenderer.invoke('cambiar-auto-backup', activo),
  ejecutarBackupManual: () => ipcRenderer.invoke('ejecutar-backup-manual'),
  abrirCarpetaBackup: () => ipcRenderer.invoke('abrir-carpeta-backup'),

  // Actualizaciones automáticas (GitHub Releases)
  onUpdaterEstado: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data)
    ipcRenderer.on('updater-estado', handler)
    return () => ipcRenderer.removeListener('updater-estado', handler)
  },
  comprobarActualizaciones: () => ipcRenderer.invoke('comprobar-actualizaciones-manual'),
  reiniciarEInstalarActualizacion: () => ipcRenderer.invoke('reiniciar-e-instalar-actualizacion'),
})
