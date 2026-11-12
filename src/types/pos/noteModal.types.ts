import { ItemCarrito } from '../../types/pos/pos'

export interface AdicionConPrecio {
  nombre: string
  precio: number
}

export interface NoteModalProps {
  productoAEditar: ItemCarrito
  setProductoAEditar: (item: ItemCarrito | null) => void
  adicionesDisponibles?: AdicionConPrecio[]
  onGuardarObservacion: (
    idTemp: string,
    nuevasNotas: string,
    adicionesPrecios: AdicionConPrecio[]
  ) => void
  esNuevoItem?: boolean
}

export interface UseNoteModalProps {
  productoAEditar: ItemCarrito
  adicionesDisponibles: AdicionConPrecio[]
  onGuardarObservacion: NoteModalProps['onGuardarObservacion']
  setProductoAEditar: NoteModalProps['setProductoAEditar']
}

export interface UseNoteModalReturn {
  requiereCarne: boolean
  carneSeleccionada: string
  setCarneSeleccionada: (carne: string) => void
  salsasSeleccionadas: string[]
  toggleSalsa: (salsa: string) => void
  seleccionarTodasLasSalsas: () => void
  seleccionarSinSalsas: () => void
  ingredientesSin: string[]
  adicionesPAGAS: AdicionConPrecio[]
  notasGenerales: string
  costoAdiciones: number
  precioFinalUnitario: number
  listaIngredientes: string[]
  setNotasGenerales: (texto: string) => void
  toggleIngredienteSin: (ing: string) => void
  toggleAdicionPaga: (adicion: AdicionConPrecio) => void
  handleGuardar: () => void
}