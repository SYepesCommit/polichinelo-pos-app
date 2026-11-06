import { app, BrowserWindow, protocol, net, nativeImage } from 'electron'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { registerAllIpcHandlers } from './ipc'
import { ensureDatabaseReady } from './config/database'
import { backupService } from './modules/backup/backup.service'
import { setupAutoUpdater } from './modules/updater/updater.service'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

if (process.platform === 'win32') {
  app.setAppUserModelId('com.polichinelo.pos')
}

let win: BrowserWindow | null

// 🔴 Registrar el protocolo 'media' como privilegiado ANTES de que la app esté lista
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  },
])

function createWindow() {
  const preloadPath = path.join(
    process.env.APP_ROOT!,
    'dist-electron',
    'preload.mjs'
  )

  const iconPath = path.join(VITE_PUBLIC, 'logoPoli.png')
  const appIcon = nativeImage.createFromPath(iconPath)

  console.log('📂 Ruta del preload:', preloadPath)

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Polichinelo POS',
    icon: appIcon,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (!appIcon.isEmpty()) {
    win.setIcon(appIcon)
  }

  //win.webContents.openDevTools()

  win.webContents.on('did-fail-load', (_event, code, description) => {
    console.error('❌ Error cargando renderer:', code, description)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(async () => {
  await ensureDatabaseReady()

  // 🔴 Manejador del protocolo media:// para servir las imágenes de la carpeta userData
  protocol.handle('media', (request) => {
    const urlSinEsquema = request.url.replace('media://', '')
    const rutaAbsoluta = path.join(app.getPath('userData'), urlSinEsquema)
    return net.fetch(pathToFileURL(rutaAbsoluta).toString())
  })

  console.log('🚀 Registrando handlers IPC...')
  registerAllIpcHandlers()
  createWindow()

  if (win) {
    setupAutoUpdater(win)
  }

  // Ejecutar backup automático si hoy es de jueves a domingo (al iniciar turno)
  backupService.ejecutarBackup('AUTOMATICO', true).catch((err) => {
    console.error('Error en backup automático inicial:', err)
  })
})

app.on('window-all-closed', async () => {
  try {
    await backupService.ejecutarBackup('AUTOMATICO', true)
  } catch (err) {
    console.error('Error en backup automático al cerrar:', err)
  }
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})