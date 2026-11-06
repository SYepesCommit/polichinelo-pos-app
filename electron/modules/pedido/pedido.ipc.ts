import { ipcMain } from 'electron'
import { pedidoService } from './pedido.service'

export function registerPedidoIPC() {
  ipcMain.removeHandler('crear-pedido')
  ipcMain.handle('crear-pedido', async (_, payload) => {
    return await pedidoService.crearPedido(payload)
  })
}