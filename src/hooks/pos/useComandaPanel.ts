import { ComandaPanelProps } from '@/types/pos/comandaPanel.types'
import { useState, useRef, useEffect } from 'react'


export const useComandaPanel = ({
  carrito,
  tipoPedido,
  nombreCliente,
  telefono = '',
  direccionCliente = '',
  montoDomicilio = 0,
  metodoPagoSeleccionado,
  bancoSeleccionado,
  total = 0,
  onAgregarItemLibre,
  onVaciarCarrito,
}: Pick<
  ComandaPanelProps,
  | 'carrito'
  | 'tipoPedido'
  | 'nombreCliente'
  | 'telefono'
  | 'direccionCliente'
  | 'montoDomicilio'
  | 'metodoPagoSeleccionado'
  | 'bancoSeleccionado'
  | 'total'
  | 'onAgregarItemLibre'
  | 'onVaciarCarrito'
>) => {
  const [mostrarModalBancos, setMostrarModalBancos] = useState(false)
  const [dropdownBancosAbierto, setDropdownBancosAbierto] = useState(false)
  const [mostrarModalItemLibre, setMostrarModalItemLibre] = useState(false)

  const [nombreItemLibre, setNombreItemLibre] = useState('')
  const [precioItemLibre, setPrecioItemLibre] = useState('')

  // Confirmación rápida para vaciar comanda
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  // Calculadora de cambio / vueltos para pagos en efectivo
  const [montoRecibido, setMontoRecibido] = useState<number>(0)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatMoneda = (monto: any) => {
    const num = Number(monto)
    return !isNaN(num) ? num.toLocaleString('es-CO') : '0'
  }

  // Reiniciar calculadora y confirmación cuando el carrito queda vacío
  useEffect(() => {
    if (carrito.length === 0) {
      setMontoRecibido(0)
      setConfirmandoVaciar(false)
    }
  }, [carrito.length])

  // Auto-cancelar confirmación de vaciar después de 3.5 segundos
  useEffect(() => {
    if (!confirmandoVaciar) return
    const timer = setTimeout(() => setConfirmandoVaciar(false), 3500)
    return () => clearTimeout(timer)
  }, [confirmandoVaciar])

  const handleVaciarClick = () => {
    if (!confirmandoVaciar) {
      setConfirmandoVaciar(true)
      return
    }
    if (onVaciarCarrito) {
      onVaciarCarrito()
    }
    setConfirmandoVaciar(false)
  }

  const esEfectivo = Boolean(
    metodoPagoSeleccionado &&
      !metodoPagoSeleccionado.requiereBanco &&
      (metodoPagoSeleccionado.codigo?.toUpperCase().includes('EFECTIVO') ||
        metodoPagoSeleccionado.nombre.toUpperCase().includes('EFECTIVO'))
  )

  const cambio = montoRecibido > 0 ? montoRecibido - total : 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownBancosAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAgregarItemLibreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const precio = parseFloat(precioItemLibre)
    if (nombreItemLibre.trim() && !isNaN(precio) && precio > 0) {
      if (onAgregarItemLibre) {
        onAgregarItemLibre(nombreItemLibre.trim(), precio)
      }
      setNombreItemLibre('')
      setPrecioItemLibre('')
      setMostrarModalItemLibre(false)
    }
  }

  const telLimpio = telefono.replace(/\D/g, '')

  const esClienteValido = () => {
    if (!nombreCliente.trim()) return false
    if (tipoPedido === 'DOMICILIO') {
      return (
        telLimpio.length >= 7 &&
        telLimpio.length <= 10 &&
        direccionCliente.trim().length > 0 &&
        Number(montoDomicilio) > 0
      )
    }
    return true
  }

  const esFormularioValido =
    carrito.length > 0 &&
    esClienteValido() &&
    Boolean(metodoPagoSeleccionado) &&
    (!metodoPagoSeleccionado?.requiereBanco || Boolean(bancoSeleccionado)) &&
    (!esEfectivo || (montoRecibido > 0 && montoRecibido >= total))

  const getMensajeFaltante = () => {
    if (carrito.length === 0) return null
    if (!nombreCliente.trim()) return 'Ingresa el nombre del cliente'
    if (tipoPedido === 'DOMICILIO') {
      if (telLimpio.length < 7 || telLimpio.length > 10)
        return 'Ingresa un teléfono válido (7 a 10 dígitos)'
      if (!direccionCliente.trim()) return 'Ingresa la dirección de entrega'
      if (!montoDomicilio || montoDomicilio <= 0)
        return 'Ingresa o selecciona el valor del domicilio'
    }
    if (!metodoPagoSeleccionado) return 'Selecciona un método de pago'
    if (metodoPagoSeleccionado.requiereBanco && !bancoSeleccionado)
      return 'Selecciona el banco destino'
    if (esEfectivo && (!montoRecibido || montoRecibido <= 0))
      return 'Obligatorio: ingresa con cuánto paga en efectivo'
    if (esEfectivo && montoRecibido < total)
      return 'El efectivo recibido es menor al total a pagar'
    return null
  }

    return {
    mostrarModalBancos,
    setMostrarModalBancos,
    dropdownBancosAbierto,
    setDropdownBancosAbierto,
    mostrarModalItemLibre,
    setMostrarModalItemLibre,
    nombreItemLibre,
    setNombreItemLibre,
    precioItemLibre,
    setPrecioItemLibre,
    confirmandoVaciar,
    setConfirmandoVaciar,
    handleVaciarClick,
    montoRecibido,
    setMontoRecibido,
    esEfectivo,
    cambio,
    dropdownRef,
    formatMoneda,
    handleAgregarItemLibreSubmit,
    esFormularioValido,
    mensajeFaltante: getMensajeFaltante(),
  }
}