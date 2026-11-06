import { useState } from 'react'
import { Categoria, CategoriasModalProps } from '@/types/producto/producto.types'

export const useCategoriasModal = ({
  onCrear,
  onActualizar,
  onEliminar,
}: Pick<CategoriasModalProps, 'onCrear' | 'onActualizar' | 'onEliminar'>) => {
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [categoriaEditandoId, setCategoriaEditandoId] = useState<number | null>(null)
  const [nombreEditado, setNombreEditado] = useState('')
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null)
  const [procesando, setProcesando] = useState(false)

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre.trim() || procesando) return

    setProcesando(true)
    try {
      await onCrear(nuevoNombre.trim())
      setNuevoNombre('')
    } catch (error) {
      console.error('Error creando categoría:', error)
    } finally {
      setProcesando(false)
    }
  }

  const handleIniciarEditar = (cat: Categoria) => {
    setCategoriaEditandoId(Number(cat.id))
    setNombreEditado(cat.nombre)
  }

  const handleGuardarEdicion = async (id: number) => {
    if (!nombreEditado.trim() || procesando) return

    setProcesando(true)
    try {
      await onActualizar(id, nombreEditado.trim())
      setCategoriaEditandoId(null)
      setNombreEditado('')
    } catch (error) {
      console.error('Error actualizando categoría:', error)
    } finally {
      setProcesando(false)
    }
  }

  const handleConfirmarEliminar = async () => {
    if (!categoriaAEliminar || procesando) return

    setProcesando(true)
    try {
      await onEliminar(Number(categoriaAEliminar.id))
      setCategoriaAEliminar(null)
    } catch (error) {
      console.error('Error eliminando categoría:', error)
    } finally {
      setProcesando(false)
    }
  }

  return {
    nuevoNombre,
    setNuevoNombre,
    categoriaEditandoId,
    setCategoriaEditandoId,
    nombreEditado,
    setNombreEditado,
    categoriaAEliminar,
    setCategoriaAEliminar,
    procesando,
    handleCrear,
    handleIniciarEditar,
    handleGuardarEdicion,
    handleConfirmarEliminar,
  }
}
