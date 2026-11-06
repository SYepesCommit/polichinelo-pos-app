import { Categoria } from "./pos"

export interface CategoriasBarProps {
  categorias: Categoria[]
  categoriaActiva: string | null
  setCategoriaActiva: (id: string | null) => void
  busquedaPos?: string
  setBusquedaPos?: (val: string) => void
  onAbrirModalEspeciales?: () => void
  onAbrirNuevoEspecial?: () => void
  onAbrirArchivados?: () => void
}