import { UsePedidoHeaderProps, UsePedidoHeaderReturn } from '@/types/pos/pedidoHeader.types'
import React from 'react'
    
export const usePedidoHeader = ({
  handleBuscarCliente,
}: UsePedidoHeaderProps): UsePedidoHeaderReturn => {
  const handleKeyDownTelefono = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBuscarCliente()
    }
  }

  return {
    handleKeyDownTelefono,
  }
}