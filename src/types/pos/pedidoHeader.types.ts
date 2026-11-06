import { TipoPedido } from '../../types/pos/pos'

export interface PedidoHeaderProps {
  tipoPedido: TipoPedido | string
  setTipoPedido: (tipo: TipoPedido) => void
  nombreCliente: string
  setNombreCliente: (v: string) => void
  telefono: string
  handleTelefonoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBuscarCliente: () => void
  direccionCliente: string
  setDireccionCliente: (v: string) => void
  referenciaCliente: string
  setReferenciaCliente: (v: string) => void
  clienteExiste: boolean | null
}

export interface UsePedidoHeaderProps {
  handleBuscarCliente: () => void
}

export interface UsePedidoHeaderReturn {
  handleKeyDownTelefono: (e: React.KeyboardEvent<HTMLInputElement>) => void
}