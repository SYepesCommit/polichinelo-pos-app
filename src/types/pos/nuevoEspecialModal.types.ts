import { Categoria } from '../../types/pos/pos'

export interface NuevoEspecialData {
  nombre: string
  precio: number
  categoriaId: string
  ingredientes?: string[]
}

export interface NuevoEspecialModalProps {
  categorias: Categoria[]
  categoriaActivaId: string | null
  onClose: () => void
  onGuardarEspecial: (data: NuevoEspecialData) => Promise<void>
}

export interface UseNuevoEspecialProps {
  categorias: Categoria[]
  categoriaActivaId: string | null
  onClose: () => void
  onGuardarEspecial: (data: NuevoEspecialData) => Promise<void>
}

export interface UseNuevoEspecialReturn {
  nombre: string
  setNombre: (valor: string) => void
  precio: string
  setPrecio: (valor: string) => void
  categoriaId: string
  setCategoriaId: (valor: string) => void
  ingredienteInput: string
  setIngredienteInput: (valor: string) => void
  ingredientes: string[]
  guardando: boolean
  handleAddIngrediente: () => void
  handleRemoveIngrediente: (index: number) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}