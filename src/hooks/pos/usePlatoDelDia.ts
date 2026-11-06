import { UsePlatoDelDiaProps, UsePlatoDelDiaReturn } from '@/types/pos/platoDelDiaModal.types'
import { useState, useMemo } from 'react'

export const usePlatoDelDia = ({
  categorias,
}: UsePlatoDelDiaProps): UsePlatoDelDiaReturn => {
  const [busqueda, setBusqueda] = useState('')

  const todosLosProductos = useMemo(() => {
    return categorias.flatMap((c) => c.productos)
  }, [categorias])

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return todosLosProductos
    const q = busqueda.toLowerCase().trim()
    return todosLosProductos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [todosLosProductos, busqueda])

  return {
    busqueda,
    setBusqueda,
    productosFiltrados,
  }
}