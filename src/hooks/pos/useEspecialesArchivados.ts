import { EspecialArchivado, UseEspecialesArchivadosProps, UseEspecialesArchivadosReturn } from '@/types/pos/especialesArchivadosModal.types'
import { useState, useEffect } from 'react'


export const useEspecialesArchivados = ({
  onRecargarMenu,
}: UseEspecialesArchivadosProps): UseEspecialesArchivadosReturn => {
  const [desactivados, setDesactivados] = useState<EspecialArchivado[]>([])
  const [cargando, setCargando] = useState(true)
  const [itemAEliminar, setItemAEliminar] = useState<EspecialArchivado | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const cargarDesactivados = async () => {
    setCargando(true)
    if (window.electronAPI?.getEspecialesDesactivados) {
      try {
        const datos = await window.electronAPI.getEspecialesDesactivados()
        setDesactivados(datos || [])
      } catch (error) {
        console.error('Error al obtener especiales desactivados:', error)
      }
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarDesactivados()
  }, [])

  const confirmarEliminacion = async () => {
    if (!itemAEliminar || !window.electronAPI?.eliminarProductoDefinitivo) return

    setCargando(true)
    setMensajeError(null)
    try {
      const res = await window.electronAPI.eliminarProductoDefinitivo(itemAEliminar.id)
      if (res?.error) {
        setMensajeError(res.error)
      } else {
        setItemAEliminar(null)
        await cargarDesactivados()
        onRecargarMenu()
      }
    } catch (error: any) {
      console.error('Error al eliminar producto definitivamente:', error)
      setMensajeError(error?.message || 'No se pudo eliminar el producto.')
    } finally {
      setCargando(false)
    }
  }

  return {
    desactivados,
    cargando,
    itemAEliminar,
    setItemAEliminar,
    confirmarEliminacion,
    mensajeError,
    setMensajeError,
  }
}