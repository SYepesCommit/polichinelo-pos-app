import { useState, useEffect } from 'react'
import { TipoPedido } from '@/types/pos/pos'

export interface UltimoPedidoCliente {
  id: number
  fechaRegistro: string | Date
  montoDomicilio: number
  total: number
  items: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    precioBase: number
    observaciones: string
  }>
}

export const usePosCliente = (tipoPedido: TipoPedido) => {
  const [nombreCliente, setNombreCliente] = useState('')
  const [observacionesGenerales, setObservacionesGenerales] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccionCliente, setDireccionCliente] = useState('')
  const [referenciaCliente, setReferenciaCliente] = useState('')
  const [montoDomicilio, setMontoDomicilio] = useState<number>(0)
  const [clienteExiste, setClienteExiste] = useState<boolean | null>(null)
  const [ultimoPedidoCliente, setUltimoPedidoCliente] = useState<UltimoPedidoCliente | null>(null)

  useEffect(() => {
    if (tipoPedido !== 'DOMICILIO') setMontoDomicilio(0)
  }, [tipoPedido])

  const buscarClientePorNumero = async (telRaw: string) => {
    const telLimpio = telRaw.trim()
    if (telLimpio.length >= 7 && window.electronAPI?.getClienteByTelefono) {
      try {
        const cliente = await window.electronAPI.getClienteByTelefono(telLimpio)
        if (cliente) {
          setNombreCliente(cliente.nombre || '')
          setDireccionCliente(cliente.direccion || '')
          setReferenciaCliente(cliente.referenciaDireccion || '')
          setClienteExiste(true)
          setUltimoPedidoCliente(cliente.ultimoPedido || null)
        } else {
          setClienteExiste(false)
          setUltimoPedidoCliente(null)
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error)
        setClienteExiste(false)
        setUltimoPedidoCliente(null)
      }
    } else {
      setClienteExiste(null)
      setUltimoPedidoCliente(null)
    }
  }

  // Búsqueda automática reactiva al digitar teléfono en DOMICILIO (sin requerir Enter físico)
  useEffect(() => {
    if (tipoPedido !== 'DOMICILIO') return

    const soloDigitos = telefono.replace(/\D/g, '')
    if (soloDigitos.length < 7) {
      setClienteExiste(null)
      setUltimoPedidoCliente(null)
      return
    }

    // Si completó los 10 dígitos de un celular colombiano, buscar de inmediato
    const delayMs = soloDigitos.length === 10 ? 80 : 400
    const timer = setTimeout(() => {
      buscarClientePorNumero(telefono)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [telefono, tipoPedido])

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setTelefono(valor)
    if (!valor.trim()) setClienteExiste(null)
  }

  const handleBuscarCliente = async () => {
    await buscarClientePorNumero(telefono)
  }

  const guardarClienteAlCobrar = async () => {
    if (telefono.trim() && nombreCliente.trim() && window.electronAPI?.upsertCliente) {
      try {
        await window.electronAPI.upsertCliente({
          telefono: telefono.trim(),
          nombre: nombreCliente.trim(),
          direccion: direccionCliente.trim(),
          referenciaDireccion: referenciaCliente.trim(),
        })
      } catch (error) {
        console.error('Error al guardar cliente al cobrar:', error)
      }
    }
  }

  const limpiarDatosCliente = () => {
    setNombreCliente('')
    setObservacionesGenerales('')
    setTelefono('')
    setDireccionCliente('')
    setReferenciaCliente('')
    setMontoDomicilio(0)
    setClienteExiste(null)
    setUltimoPedidoCliente(null)
  }

  return {
    nombreCliente,
    setNombreCliente,
    observacionesGenerales,
    setObservacionesGenerales,
    telefono,
    setTelefono,
    direccionCliente,
    setDireccionCliente,
    referenciaCliente,
    setReferenciaCliente,
    montoDomicilio,
    setMontoDomicilio,
    clienteExiste,
    setClienteExiste,
    ultimoPedidoCliente,
    handleTelefonoChange,
    handleBuscarCliente,
    guardarClienteAlCobrar,
    limpiarDatosCliente,
  }
}
