import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain, app } from 'electron'

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // En modo desarrollo no intentamos actualizar
  if (!app.isPackaged) {
    console.log('ℹ️ Modo desarrollo: Auto-actualizaciones desactivadas')
    return
  }

  // Configuración de autoUpdater
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Buscando actualizaciones en GitHub...')
    mainWindow.webContents.send('updater-estado', { estado: 'comprobando' })
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`✨ Actualización encontrada: v${info.version}`)
    mainWindow.webContents.send('updater-estado', {
      estado: 'disponible',
      version: info.version,
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('✅ La aplicación está en su versión más reciente.')
    mainWindow.webContents.send('updater-estado', { estado: 'al-dia' })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`📥 Descargando actualización: ${Math.round(progressObj.percent)}%`)
    mainWindow.webContents.send('updater-estado', {
      estado: 'descargando',
      progreso: Math.round(progressObj.percent),
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`📦 Actualización v${info.version} lista para instalar.`)
    mainWindow.webContents.send('updater-estado', {
      estado: 'descargada',
      version: info.version,
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('❌ Error en autoUpdater:', err)
    mainWindow.webContents.send('updater-estado', {
      estado: 'error',
      error: err.message,
    })
  })

  // IPC para que el usuario pueda forzar reiniciar e instalar desde la UI si lo desea
  ipcMain.handle('reiniciar-e-instalar-actualizacion', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('comprobar-actualizaciones-manual', async () => {
    try {
      const res = await autoUpdater.checkForUpdates()
      return { ok: true, version: res?.updateInfo?.version }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  })

  // Buscar actualizaciones 3 segundos después de abrir para no frenar el render inicial
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('No se pudo comprobar actualizaciones:', err.message)
    })
  }, 3000)
}
