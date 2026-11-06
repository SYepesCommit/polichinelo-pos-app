export type FiltroEstadoProducto = 'TODOS' | 'DISPONIBLES' | 'AGOTADOS' | 'ESPECIALES'

export interface KpisProducto {
  total: number
  disponibles: number
  agotados: number
  especiales: number
}

export interface Categoria {
  id: number | string
  nombre: string
  creadoEn?: Date | string
  _count?: {
    productos: number
  }
}

export interface Producto {
  id: number
  nombre: string
  precioVenta: number
  descripcion?: string | null
  costoBase: number
  activo: boolean
  esEspecial: boolean
  categoriaId?: number | null
  categoria?: Categoria | null
  imagenUrl?: string | null
  ingredientes?: string | any[] | null
  creadoEn?: Date | string
}

export interface FormularioProductoDTO {
  id?: number
  nombre: string
  precioVenta: number
  costoBase?: number
  categoriaId?: number | null
  imagenUrl?: string | null
  esEspecial?: boolean
  activo?: boolean
  ingredientes?: string[]
}

export interface ProductoModalProps {
  productoEditar?: Producto | null
  categorias: Categoria[]
  onClose: () => void
  onGuardar: (dto: FormularioProductoDTO) => Promise<void>
}

export interface CategoriasModalProps {
  categorias: Categoria[]
  onClose: () => void
  onCrear: (nombre: string) => Promise<void>
  onActualizar: (id: number, nombre: string) => Promise<void>
  onEliminar: (id: number) => Promise<void>
}

export interface IngredientesTagInputProps {
  ingredientes: string[]
  onAgregar: (nombre: string) => void
  onRemover: (nombre: string) => void
}

export interface ProductosHeaderProps {
  cargando: boolean
  onRecargar: () => void
  onAbrirCategorias: () => void
  onAbrirNuevo: () => void
}

export interface ProductosKpisProps {
  kpis: KpisProducto
  filtroEstado: FiltroEstadoProducto
  setFiltroEstado: (estado: FiltroEstadoProducto) => void
}

export interface ProductosFiltersProps {
  busqueda: string
  setBusqueda: (v: string) => void
  categorias: Categoria[]
  categoriaSeleccionada: number | 'TODAS'
  setCategoriaSeleccionada: (cat: number | 'TODAS') => void
}

export interface ProductoCardProps {
  producto: Producto
  formatMoneda: (monto: number) => string
  onToggleActivo: (prod: Producto) => void
  onDuplicar: (prod: Producto) => void
  onEditar: (prod: Producto) => void
  onEliminar: (prod: Producto) => void
}
