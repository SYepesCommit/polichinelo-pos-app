import { ipcMain } from 'electron'
import { backupService } from './backup.service'

export function registerBackupIpc() {
  ipcMain.handle('get-backup-estado', async () => {
    try {
      return backupService.obtenerEstado()
    } catch (error) {
      console.error('Error IPC get-backup-estado:', error)
      return null
    }
  })

  ipcMain.handle('seleccionar-carpeta-backup', async () => {
    try {
      return await backupService.seleccionarCarpetaDestino()
    } catch (error) {
      console.error('Error IPC seleccionar-carpeta-backup:', error)
      return null
    }
  })

  ipcMain.handle('cambiar-auto-backup', async (_, activo: boolean) => {
    try {
      return backupService.cambiarAutoJuevesADomingo(activo)
    } catch (error) {
      console.error('Error IPC cambiar-auto-backup:', error)
      return null
    }
  })

  ipcMain.handle('ejecutar-backup-manual', async () => {
    try {
      const res = await backupService.ejecutarBackup('MANUAL')
      const estado = backupService.obtenerEstado()
      return { ...res, estado }
    } catch (error: any) {
      console.error('Error IPC ejecutar-backup-manual:', error)
      return { ok: false, error: error?.message || 'Error al ejecutar backup manual' }
    }
  })

  ipcMain.handle('abrir-carpeta-backup', async () => {
    try {
      return await backupService.abrirCarpetaDestino()
    } catch (error: any) {
      console.error('Error IPC abrir-carpeta-backup:', error)
      return { ok: false, error: error?.message || 'Error al abrir carpeta' }
    }
  })
}
