import { UseGestionBancosProps, UseGestionBancosReturn } from '@/types/pos/bancoModal.types'
import { Banco } from '@prisma/client'
import { useState } from 'react'


export const useGestionBancos = ({ onBancoAgregado }: UseGestionBancosProps): UseGestionBancosReturn => {
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [bancoAEliminar, setBancoAEliminar] = useState<Banco | null>(null)
  const [cargando, setCargando] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre.trim() || !window.electronAPI) return

    setCargando(true)
    setErrorMsg(null)
    try {
      await window.electronAPI.crearBanco(nuevoNombre.trim())
      setNuevoNombre('')
      onBancoAgregado()
    } catch (error) {
      console.error('Error al crear banco:', error)
      setErrorMsg('No se pudo crear el banco.')
    } finally {
      setCargando(false)
    }
  }

  const confirmarEliminacion = async () => {
    if (!bancoAEliminar || !window.electronAPI) return

    setCargando(true)
    setErrorMsg(null)
    try {
      await window.electronAPI.eliminarBanco(bancoAEliminar.id)
      setBancoAEliminar(null)
      onBancoAgregado()
    } catch (error) {
      console.error('Error al eliminar banco:', error)
      setErrorMsg('No se pudo eliminar el banco porque está asociado a pagos realizados.')
    } finally {
      setCargando(false)
    }
  }

  return {
    nuevoNombre,
    setNuevoNombre,
    bancoAEliminar,
    setBancoAEliminar,
    cargando,
    errorMsg,
    handleCrear,
    confirmarEliminacion,
  }
}