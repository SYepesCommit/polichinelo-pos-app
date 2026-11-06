import { Banco } from "./pos"

export interface BancoModalProps {
  bancos: Banco[]
  onClose: () => void
  onBancoAgregado: () => void
}

export interface UseGestionBancosProps {
  onBancoAgregado: () => void
}

export interface UseGestionBancosReturn {
  nuevoNombre: string
  setNuevoNombre: (valor: string) => void
  bancoAEliminar: Banco | null
  setBancoAEliminar: (banco: Banco | null) => void
  cargando: boolean
  errorMsg: string | null
  handleCrear: (e: React.FormEvent) => Promise<void>
  confirmarEliminacion: () => Promise<void>
}