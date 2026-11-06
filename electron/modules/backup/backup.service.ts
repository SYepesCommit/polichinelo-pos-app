import path from 'node:path'
import fs from 'node:fs'
import { app, dialog, shell } from 'electron'
import { prisma, getDatabasePath } from '../../config/database'
import { BackupArchivoItem, BackupConfig, BackupEstadoRespuesta } from '@/types/backup/backup.types'

const MAX_SEMANAS_GUARDADAS = 8 // Conserva los últimos 8 fines de semana (~2 meses)
const INTERVALO_MINUTOS_VENTAS = 30 // Durante el turno nocturno respalda máximo cada 30 min

const DIAS_INFO: Record<
  number,
  { nombre: string; nombreArchivo: string; orden: number; esJuevesADomingo: boolean }
> = {
  1: { nombre: 'Lunes', nombreArchivo: 'Lunes', orden: 0, esJuevesADomingo: false },
  2: { nombre: 'Martes', nombreArchivo: 'Martes', orden: 0, esJuevesADomingo: false },
  3: { nombre: 'Miércoles', nombreArchivo: 'Miercoles', orden: 0, esJuevesADomingo: false },
  4: { nombre: 'Jueves', nombreArchivo: '1_Jueves', orden: 1, esJuevesADomingo: true },
  5: { nombre: 'Viernes', nombreArchivo: '2_Viernes', orden: 2, esJuevesADomingo: true },
  6: { nombre: 'Sábado', nombreArchivo: '3_Sabado', orden: 3, esJuevesADomingo: true },
  7: { nombre: 'Domingo', nombreArchivo: '4_Domingo', orden: 4, esJuevesADomingo: true },
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'backup-config.json')
}

function getDefaultBackupDir(): string {
  return path.join(app.getPath('userData'), 'Backups_Polichinelo')
}

/**
 * Obtiene la fecha y día actual en hora de Colombia (America/Bogota).
 */
function obtenerInfoTurnoColombia(ahora = new Date()) {
  const horaColStr = ahora.toLocaleTimeString('en-GB', {
    timeZone: 'America/Bogota',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const fechaYMD = ahora.toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota',
  })

  const [y, m, d] = fechaYMD.split('-').map(Number)
  const dtUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const utcDay = dtUtc.getUTCDay()
  const isoDay = utcDay === 0 ? 7 : utcDay // 1 = Lunes ... 4 = Jueves ... 7 = Domingo

  // Calcular el Jueves (4) y el Domingo (7) de esa misma semana para el nombre de la carpeta
  const dtJueves = new Date(dtUtc.getTime() + (4 - isoDay) * 86400000)
  const dtDomingo = new Date(dtUtc.getTime() + (7 - isoDay) * 86400000)

  const juevesStr = dtJueves.toISOString().slice(0, 10)
  const domingoStr = dtDomingo.toISOString().slice(0, 10)
  const nombreCarpetaFinDeSemana = `FinDeSemana_${juevesStr}_al_${domingoStr}`

  const infoDia = DIAS_INFO[isoDay] || DIAS_INFO[1]

  return {
    fechaYMD,
    horaGuiones: horaColStr.replace(/:/g, '-'),
    nombreDia: infoDia.nombre,
    nombreDiaArchivo: infoDia.nombreArchivo,
    esJuevesADomingo: infoDia.esJuevesADomingo,
    nombreCarpetaFinDeSemana,
  }
}

export const backupService = {
  leerConfig(): BackupConfig {
    const configPath = getConfigPath()
    const defaultConfig: BackupConfig = {
      carpetaDestino: getDefaultBackupDir(),
      autoJuevesADomingo: true,
      ultimoBackupFecha: null,
      ultimoBackupArchivo: null,
      ultimoBackupTipo: null,
    }

    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8')
        const parsed = JSON.parse(raw)
        return {
          carpetaDestino:
            typeof parsed.carpetaDestino === 'string' && parsed.carpetaDestino.trim()
              ? parsed.carpetaDestino.trim()
              : defaultConfig.carpetaDestino,
          autoJuevesADomingo:
            typeof parsed.autoJuevesADomingo === 'boolean'
              ? parsed.autoJuevesADomingo
              : true,
          ultimoBackupFecha: parsed.ultimoBackupFecha || null,
          ultimoBackupArchivo: parsed.ultimoBackupArchivo || null,
          ultimoBackupTipo: parsed.ultimoBackupTipo || null,
        }
      }
    } catch (error) {
      console.error('Error leyendo backup-config.json:', error)
    }

    this.guardarConfig(defaultConfig)
    return defaultConfig
  },

  guardarConfig(config: BackupConfig): void {
    try {
      const configPath = getConfigPath()
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error guardando backup-config.json:', error)
    }
  },

  asegurarCarpeta(carpeta: string): string {
    try {
      if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true })
      }
      return carpeta
    } catch (error) {
      console.warn(
        '⚠️ No se pudo acceder a la carpeta de backup configurada, usando carpeta local por defecto:',
        error
      )
      const fallback = getDefaultBackupDir()
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true })
      }
      return fallback
    }
  },

  listarArchivosRecientes(carpetaRaiz: string): BackupArchivoItem[] {
    try {
      if (!fs.existsSync(carpetaRaiz)) return []
      const entradasRaiz = fs.readdirSync(carpetaRaiz, { withFileTypes: true })
      const archivos: BackupArchivoItem[] = []

      for (const entrada of entradasRaiz) {
        const rutaEntrada = path.join(carpetaRaiz, entrada.name)

        if (entrada.isDirectory()) {
          // Recorrer subcarpetas de FinDeSemana_...
          try {
            const subArchivos = fs.readdirSync(rutaEntrada)
            for (const sub of subArchivos) {
              if (!sub.endsWith('.db') || sub.endsWith('.tmp.db')) continue
              const rutaCompleta = path.join(rutaEntrada, sub)
              const stat = fs.statSync(rutaCompleta)
              if (stat.isFile()) {
                archivos.push({
                  nombre: `${entrada.name} / ${sub}`,
                  rutaCompleta,
                  fechaModificacion: stat.mtime.toISOString(),
                  tamanoBytes: stat.size,
                })
              }
            }
          } catch {
            // Ignorar subcarpeta inaccesible
          }
        } else if (
          entrada.isFile() &&
          entrada.name.endsWith('.db') &&
          !entrada.name.endsWith('.tmp.db')
        ) {
          try {
            const stat = fs.statSync(rutaEntrada)
            archivos.push({
              nombre: entrada.name,
              rutaCompleta: rutaEntrada,
              fechaModificacion: stat.mtime.toISOString(),
              tamanoBytes: stat.size,
            })
          } catch {
            // Ignorar
          }
        }
      }

      return archivos.sort(
        (a, b) =>
          new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime()
      )
    } catch (error) {
      console.error('Error listando archivos de backup:', error)
      return []
    }
  },

  limpiarSemanasAntiguas(carpetaRaiz: string): void {
    try {
      if (!fs.existsSync(carpetaRaiz)) return
      const entradas = fs.readdirSync(carpetaRaiz, { withFileTypes: true })
      const carpetasSemana = entradas
        .filter((e) => e.isDirectory() && e.name.startsWith('FinDeSemana_'))
        .map((e) => e.name)
        .sort()
        .reverse() // Más recientes primero

      if (carpetasSemana.length <= MAX_SEMANAS_GUARDADAS) return

      const carpetasABorrar = carpetasSemana.slice(MAX_SEMANAS_GUARDADAS)
      for (const nombreCarpeta of carpetasABorrar) {
        try {
          fs.rmSync(path.join(carpetaRaiz, nombreCarpeta), { recursive: true, force: true })
        } catch {
          // Ignorar si está ocupada
        }
      }
    } catch (error) {
      console.error('Error limpiando carpetas de semanas antiguas:', error)
    }
  },

  async generarCopiaSqliteSegura(rutaDestinoFinal: string): Promise<void> {
    const tempFile = path.join(
      app.getPath('temp'),
      `polichinelo_backup_${Date.now()}.tmp.db`
    )

    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile)
      }

      const rutaSqlEscapada = tempFile.replace(/\\/g, '/').replace(/'/g, "''")
      await prisma.$executeRawUnsafe(`VACUUM INTO '${rutaSqlEscapada}'`)
      fs.copyFileSync(tempFile, rutaDestinoFinal)
    } catch (vacuumError) {
      console.warn('⚠️ VACUUM INTO falló, aplicando copia directa de archivo SQLite:', vacuumError)
      const origenDb = getDatabasePath()
      fs.copyFileSync(origenDb, rutaDestinoFinal)
    } finally {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      } catch {
        // Ignorar limpieza de temporal
      }
    }
  },

  async ejecutarBackup(
    tipo: 'AUTOMATICO' | 'MANUAL' = 'MANUAL',
    forzar = false
  ): Promise<{ ok: boolean; archivo?: string; fecha?: string; omitido?: boolean; error?: string }> {
    try {
      const config = this.leerConfig()
      const infoTurno = obtenerInfoTurnoColombia()

      if (tipo === 'AUTOMATICO') {
        if (!config.autoJuevesADomingo || !infoTurno.esJuevesADomingo) {
          return { ok: true, omitido: true }
        }

        // Si no es forzado (ej. al cobrar un pedido), respetar intervalo de 30 minutos
        if (!forzar && config.ultimoBackupFecha) {
          const msDesdeUltimo =
            Date.now() - new Date(config.ultimoBackupFecha).getTime()
          const minutosDesdeUltimo = msDesdeUltimo / (1000 * 60)
          if (minutosDesdeUltimo < INTERVALO_MINUTOS_VENTAS) {
            return { ok: true, omitido: true }
          }
        }
      }

      const carpetaRaiz = this.asegurarCarpeta(config.carpetaDestino)
      const carpetaFinDeSemana = this.asegurarCarpeta(
        path.join(carpetaRaiz, infoTurno.nombreCarpetaFinDeSemana)
      )

      const nombreArchivo =
        tipo === 'AUTOMATICO'
          ? `${infoTurno.nombreDiaArchivo}_${infoTurno.fechaYMD}.db`
          : `Manual_${infoTurno.fechaYMD}_${infoTurno.horaGuiones}.db`

      const rutaDestino = path.join(carpetaFinDeSemana, nombreArchivo)
      await this.generarCopiaSqliteSegura(rutaDestino)

      // Si es manual en día de jueves a domingo, actualizar también el archivo del día en esa carpeta
      if (tipo === 'MANUAL' && infoTurno.esJuevesADomingo) {
        const nombreArchivoDia = `${infoTurno.nombreDiaArchivo}_${infoTurno.fechaYMD}.db`
        const rutaDia = path.join(carpetaFinDeSemana, nombreArchivoDia)
        try {
          fs.copyFileSync(rutaDestino, rutaDia)
        } catch {
          // Ignorar
        }
      }

      this.limpiarSemanasAntiguas(carpetaRaiz)

      const ahoraIso = new Date().toISOString()
      const nuevaConfig: BackupConfig = {
        ...config,
        ultimoBackupFecha: ahoraIso,
        ultimoBackupArchivo: rutaDestino,
        ultimoBackupTipo: tipo,
      }
      this.guardarConfig(nuevaConfig)

      console.log(`✅ Backup (${tipo}) guardado exitosamente en:`, rutaDestino)
      return {
        ok: true,
        archivo: rutaDestino,
        fecha: ahoraIso,
      }
    } catch (error: any) {
      console.error(`❌ Error ejecutando backup (${tipo}):`, error)
      return {
        ok: false,
        error: error?.message || 'No se pudo completar la copia de seguridad.',
      }
    }
  },

  obtenerEstado(): BackupEstadoRespuesta {
    const config = this.leerConfig()
    const infoTurno = obtenerInfoTurnoColombia()
    const carpetaActiva = this.asegurarCarpeta(config.carpetaDestino)
    const archivosRecientes = this.listarArchivosRecientes(carpetaActiva).slice(0, 15)

    return {
      config,
      esDiaAutoBackup: infoTurno.esJuevesADomingo,
      nombreDiaHoy: infoTurno.nombreDia,
      archivosRecientes,
    }
  },

  async seleccionarCarpetaDestino(): Promise<BackupEstadoRespuesta | null> {
    const configActual = this.leerConfig()
    const resultado = await dialog.showOpenDialog({
      title: 'Seleccionar carpeta de Google Drive o destino para Backups',
      defaultPath: fs.existsSync(configActual.carpetaDestino)
        ? configActual.carpetaDestino
        : app.getPath('documents'),
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Usar esta carpeta',
    })

    if (resultado.canceled || resultado.filePaths.length === 0) {
      return null
    }

    const nuevaCarpeta = resultado.filePaths[0]
    this.asegurarCarpeta(nuevaCarpeta)

    const nuevaConfig: BackupConfig = {
      ...configActual,
      carpetaDestino: nuevaCarpeta,
    }
    this.guardarConfig(nuevaConfig)

    return this.obtenerEstado()
  },

  cambiarAutoJuevesADomingo(activo: boolean): BackupEstadoRespuesta {
    const configActual = this.leerConfig()
    const nuevaConfig: BackupConfig = {
      ...configActual,
      autoJuevesADomingo: Boolean(activo),
    }
    this.guardarConfig(nuevaConfig)
    return this.obtenerEstado()
  },

  async abrirCarpetaDestino(): Promise<{ ok: boolean; error?: string }> {
    try {
      const config = this.leerConfig()
      const carpeta = this.asegurarCarpeta(config.carpetaDestino)
      const err = await shell.openPath(carpeta)
      if (err) {
        return { ok: false, error: err }
      }
      return { ok: true }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'No se pudo abrir la carpeta' }
    }
  },
}
