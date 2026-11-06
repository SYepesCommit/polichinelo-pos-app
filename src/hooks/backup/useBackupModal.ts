import { useState, useEffect, useCallback } from 'react'
import { BackupEstadoRespuesta } from '@/types/backup/backup.types'

export const useBackupModal = () => {
  const [estado, setEstado] = useState<BackupEstadoRespuesta | null>(null)
  const [cargando, setCargando] = useState(true)
  const [ejecutandoManual, setEjecutandoManual] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const cargarEstado = useCallback(async () => {
    setCargando(true)
    try {
      if (window.electronAPI?.getBackupEstado) {
        const res = await window.electronAPI.getBackupEstado()
        if (res) setEstado(res)
      }
    } catch (error) {
      console.error('Error al consultar estado de backups:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarEstado()
  }, [cargarEstado])

  const handleSeleccionarCarpeta = async () => {
    setMensajeExito(null)
    setMensajeError(null)
    try {
      if (!window.electronAPI?.seleccionarCarpetaBackup) return
      const res = await window.electronAPI.seleccionarCarpetaBackup()
      if (res) {
        setEstado(res)
        setMensajeExito('Carpeta de destino actualizada correctamente.')
      }
    } catch (error) {
      console.error('Error al seleccionar carpeta de backup:', error)
      setMensajeError('No se pudo cambiar la carpeta de destino.')
    }
  }

  const handleToggleAutoJuevesADomingo = async () => {
    if (!estado || !window.electronAPI?.cambiarAutoBackup) return
    setMensajeExito(null)
    setMensajeError(null)
    try {
      const nuevoValor = !estado.config.autoJuevesADomingo
      const res = await window.electronAPI.cambiarAutoBackup(nuevoValor)
      if (res) {
        setEstado(res)
      }
    } catch (error) {
      console.error('Error cambiando auto-backup:', error)
    }
  }

  const handleCrearBackupManual = async () => {
    if (!window.electronAPI?.ejecutarBackupManual) return
    setEjecutandoManual(true)
    setMensajeExito(null)
    setMensajeError(null)
    try {
      const res = await window.electronAPI.ejecutarBackupManual()
      if (res?.ok) {
        if (res.estado) setEstado(res.estado)
        setMensajeExito('Copia de seguridad creada exitosamente.')
      } else {
        setMensajeError(res?.error || 'No se pudo generar la copia de seguridad.')
      }
    } catch (error: any) {
      setMensajeError(error?.message || 'Error al generar copia de seguridad.')
    } finally {
      setEjecutandoManual(false)
    }
  }

  const handleAbrirCarpeta = async () => {
    if (!window.electronAPI?.abrirCarpetaBackup) return
    await window.electronAPI.abrirCarpetaBackup()
  }

  const formatearFechaLegible = (iso?: string | null) => {
    if (!iso) return 'Sin respaldos registrados aún'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatearTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(2)} MB`
  }

  return {
    estado,
    cargando,
    ejecutandoManual,
    mensajeExito,
    mensajeError,
    handleSeleccionarCarpeta,
    handleToggleAutoJuevesADomingo,
    handleCrearBackupManual,
    handleAbrirCarpeta,
    formatearFechaLegible,
    formatearTamano,
  }
}
