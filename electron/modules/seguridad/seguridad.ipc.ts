import { ipcMain } from 'electron'
import { seguridadService } from './seguridad.service'

export function registerSeguridadIpc() {
  ipcMain.handle('verificar-pin', async (_event, pin: string) => {
    try {
      return seguridadService.verificarPin(pin)
    } catch (error) {
      console.error('Error en IPC verificar-pin:', error)
      return false
    }
  })

  ipcMain.handle(
    'cambiar-pin',
    async (_event, data: { pinActual: string; pinNuevo: string }) => {
      try {
        return seguridadService.cambiarPin(data.pinActual, data.pinNuevo)
      } catch (error: any) {
        console.error('Error en IPC cambiar-pin:', error)
        return { ok: false, error: error.message || 'Error al cambiar el PIN' }
      }
    }
  )
}
