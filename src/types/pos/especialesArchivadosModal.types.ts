export interface EspecialArchivado {
  id: number
  nombre: string
  precioVenta: number
  descripcion?: string | null
  [key: string]: any
}

export interface EspecialesArchivadosModalProps {
  onClose: () => void
  onRecargarMenu: () => void
}

export interface UseEspecialesArchivadosProps {
  onRecargarMenu: () => void
}

export interface UseEspecialesArchivadosReturn {
  desactivados: EspecialArchivado[]
  cargando: boolean
  itemAEliminar: EspecialArchivado | null
  setItemAEliminar: (item: EspecialArchivado | null) => void
  confirmarEliminacion: () => Promise<void>
  mensajeError: string | null
  setMensajeError: (msg: string | null) => void
}