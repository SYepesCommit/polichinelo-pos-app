export interface PinSupervisorModalProps {
  titulo?: string
  descripcion?: string
  onExito: () => void
  onCancelar: () => void
}

export interface CambiarPinModalProps {
  onCerrar: () => void
}

export type PasoPin = 'ACTUAL' | 'NUEVO' | 'CONFIRMAR' | 'EXITO'

export interface NumericKeypadProps {
  pinLength: number
  error: boolean
  disabled?: boolean
  onDigit: (digit: string) => void
  onDelete: () => void
  onCancel: () => void
}
