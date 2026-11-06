import { registerProductoIpc } from './modules/producto/producto.ipc'
import { registerClienteIpc } from './modules/cliente/cliente.ipc'
import { registerPedidoIPC } from './modules/pedido/pedido.ipc'
import { registerVentaIpc } from './modules/venta/venta.ipc'
import { registerGastosIpc } from './modules/gasto/gasto.ipc'
import { registerSeguridadIpc } from './modules/seguridad/seguridad.ipc'
import { registerBackupIpc } from './modules/backup/backup.ipc'

export function registerAllIpcHandlers() {
  console.log('🔌 Registrando todos los manejadores de IPC...')
  registerProductoIpc()
  registerClienteIpc()
  registerPedidoIPC()
  registerVentaIpc()
  registerGastosIpc()
  registerSeguridadIpc()
  registerBackupIpc()
}
