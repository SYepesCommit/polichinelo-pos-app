import { Categoria, Producto } from '../../types/pos/pos'

export interface PlatoDelDiaModalProps {
  categorias: Categoria[]
  onClose: () => void
  onToggleEspecial: (productoId: string, esEspecial: boolean) => Promise<void>
  onDesactivarProducto?: (productoId: string) => Promise<void>
}

export interface UsePlatoDelDiaProps {
  categorias: Categoria[]
}

export interface UsePlatoDelDiaReturn {
  busqueda: string
  setBusqueda: (v: string) => void
  productosFiltrados: Producto[]
}