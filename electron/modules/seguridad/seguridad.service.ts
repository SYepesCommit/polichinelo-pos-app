import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

interface ConfigSeguridad {
  pinSupervisor: string
}

const DEFAULT_CONFIG: ConfigSeguridad = {
  pinSupervisor: '1234',
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'seguridad-config.json')
}

function leerConfig(): ConfigSeguridad {
  try {
    const filePath = getConfigPath()
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8')
      return DEFAULT_CONFIG
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      pinSupervisor:
        typeof parsed.pinSupervisor === 'string' && /^\d{4}$/.test(parsed.pinSupervisor)
          ? parsed.pinSupervisor
          : DEFAULT_CONFIG.pinSupervisor,
    }
  } catch (error) {
    console.error('Error leyendo configuración de seguridad:', error)
    return DEFAULT_CONFIG
  }
}

function guardarConfig(config: ConfigSeguridad): void {
  const filePath = getConfigPath()
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8')
}

export const seguridadService = {
  verificarPin(pinIngresado: string): boolean {
    const config = leerConfig()
    return pinIngresado === config.pinSupervisor
  },

  cambiarPin(pinActual: string, pinNuevo: string): { ok: boolean; error?: string } {
    const config = leerConfig()
    if (pinActual !== config.pinSupervisor) {
      return { ok: false, error: 'El PIN actual es incorrecto.' }
    }
    if (!/^\d{4}$/.test(pinNuevo)) {
      return { ok: false, error: 'El nuevo PIN debe tener exactamente 4 dígitos numéricos.' }
    }
    guardarConfig({ pinSupervisor: pinNuevo })
    return { ok: true }
  },
}
