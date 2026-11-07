import { useState, useEffect } from 'react'
import {
  Banco,
  Categoria,
  DetallePedidoInput,
  MetodoPago,
  PagoInput,
  TipoPedido,
} from '../../types/pos/pos'
import { DatosComandaCocina, FormEspecialData } from '../../types/pos/posView.types'
import { usePosCliente } from './usePosCliente'
import { usePosCarrito } from './usePosCarrito'

export const usePosState = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [busquedaPos, setBusquedaPos] = useState<string>('')
  const [tipoPedido, setTipoPedido] = useState<TipoPedido>('MESA')
  const [cobrando, setCobrando] = useState<boolean>(false)

  // Métodos de Pago y Bancos
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPago | null>(null)
  const [bancos, setBancos] = useState<Banco[]>([])
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>('')

  // Modales de Especiales y Tiquete
  const [mostrarModalNuevoEspecial, setMostrarModalNuevoEspecial] = useState(false)
  const [mostrarModalArchivados, setMostrarModalArchivados] = useState(false)
  const [mostrarModalEspeciales, setMostrarModalEspeciales] = useState(false)
  const [ticketParaImprimir, setTicketParaImprimir] = useState<DatosComandaCocina | null>(null)

  // Sub-hooks especializados
  const clienteHook = usePosCliente(tipoPedido)
  const carritoHook = usePosCarrito(tipoPedido, clienteHook.montoDomicilio)

  useEffect(() => {
    async function cargarDatosBD() {
      if (!window.electronAPI) return
      try {
        const datosMenu = await window.electronAPI.getCategoriasProductos()
        if (Array.isArray(datosMenu) && datosMenu.length > 0) {
          setCategorias(datosMenu)
          setCategoriaActiva(datosMenu[0].id)
        }
        if (window.electronAPI.getMetodosPago) {
          const metodosBD = await window.electronAPI.getMetodosPago()
          if (Array.isArray(metodosBD) && metodosBD.length > 0) {
            const activos = metodosBD.filter((m) => m.activo)
            setMetodosPago(activos)
            setMetodoPagoSeleccionado(activos[0])
          }
        }
        if (window.electronAPI.getBancos) {
          const bancosBD = await window.electronAPI.getBancos()
          if (Array.isArray(bancosBD)) {
            const bancosActivos = bancosBD.filter((b) => b.activo)
            setBancos(bancosActivos)
            if (bancosActivos.length > 0) {
              setBancoSeleccionado(bancosActivos[0].id)
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
      }
    }
    cargarDatosBD()
  }, [])

  const recargarMenu = async () => {
    if (window.electronAPI?.getCategoriasProductos) {
      const datosMenu = await window.electronAPI.getCategoriasProductos()
      if (Array.isArray(datosMenu)) setCategorias(datosMenu)
    }
  }

  const handleGenerarComandaTicket = (
    pedidoRespuesta?: any,
    datosEfectivo?: { montoRecibido?: number; cambio?: number }
  ) => {
    if (carritoHook.carrito.length === 0 && !pedidoRespuesta) return

    const itemsFormateados = (pedidoRespuesta?.detalles || carritoHook.carrito).map((item: any) => ({
      nombre: item.producto?.nombre || item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario || item.producto?.precio || 0,
      subtotal: item.subtotal || (item.producto?.precio || 0) * item.cantidad,
      observaciones: item.observaciones || '',
    }))

    const bancoObj = bancos.find((b) => b.id === bancoSeleccionado)

    const comandaData: DatosComandaCocina = {
      consecutivo: pedidoRespuesta?.id
        ? String(pedidoRespuesta.id).padStart(6, '0')
        : Date.now().toString().slice(-4),
      fecha: new Date().toLocaleDateString('es-CO'),
      hora: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      tipoPedido,
      cliente: {
        nombre: clienteHook.nombreCliente.trim() || 'Cliente',
        telefono: tipoPedido === 'DOMICILIO' ? clienteHook.telefono.trim() : '',
        direccion: tipoPedido === 'DOMICILIO' ? clienteHook.direccionCliente.trim() : '',
        referenciaDireccion:
          tipoPedido === 'DOMICILIO' && clienteHook.referenciaCliente.trim()
            ? clienteHook.referenciaCliente.trim()
            : undefined,
      },
      observacionesGenerales: clienteHook.observacionesGenerales.trim() || undefined,
      items: itemsFormateados,
      subtotal: carritoHook.subtotalCarrito,
      costoDomicilio: tipoPedido === 'DOMICILIO' ? clienteHook.montoDomicilio : 0,
      total: carritoHook.total,
      metodoPago: metodoPagoSeleccionado?.nombre || 'EFECTIVO',
      bancoNombre: metodoPagoSeleccionado?.requiereBanco ? bancoObj?.nombre : undefined,
      montoRecibido: datosEfectivo?.montoRecibido,
      cambio: datosEfectivo?.cambio,
    }

    setTicketParaImprimir(comandaData)
    return comandaData
  }

  const handleCobrar = async (datosEfectivo?: { montoRecibido?: number; cambio?: number }) => {
    if (cobrando || carritoHook.carrito.length === 0 || !metodoPagoSeleccionado) return
    if (!clienteHook.nombreCliente.trim()) return

    if (
      tipoPedido === 'DOMICILIO' &&
      (!clienteHook.montoDomicilio || clienteHook.montoDomicilio <= 0)
    ) {
      return
    }

    setCobrando(true)
    try {
      await clienteHook.guardarClienteAlCobrar()
      const detallesPayload: DetallePedidoInput[] = carritoHook.carrito.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        observaciones: item.observaciones || undefined,
      }))

      const pagosPayload: PagoInput[] = [
        {
          metodoPagoId: metodoPagoSeleccionado.id,
          metodoPago: metodoPagoSeleccionado.codigo || metodoPagoSeleccionado.nombre,
          bancoId: metodoPagoSeleccionado.requiereBanco ? bancoSeleccionado : undefined,
          monto: carritoHook.total,
        },
      ]

      const payload = {
        tipoPedido,
        montoDomicilio: tipoPedido === 'DOMICILIO' ? clienteHook.montoDomicilio : 0,
        detallesDestino: clienteHook.nombreCliente.trim(),
        observacionesGenerales: clienteHook.observacionesGenerales.trim() || undefined,
        clienteData: {
          telefono: tipoPedido === 'DOMICILIO' ? clienteHook.telefono.trim() : '',
          nombre: clienteHook.nombreCliente.trim(),
          direccion: tipoPedido === 'DOMICILIO' ? clienteHook.direccionCliente.trim() : '',
          referenciaDireccion:
            tipoPedido === 'DOMICILIO' && clienteHook.referenciaCliente.trim()
              ? clienteHook.referenciaCliente.trim()
              : undefined,
        },
        detalles: detallesPayload,
        pagos: pagosPayload,
        total: carritoHook.total,
      }

      if (!window.electronAPI?.crearPedido) {
        throw new Error('API de Electron no disponible')
      }
      const pedidoCreado = await window.electronAPI.crearPedido(payload)
      if (!pedidoCreado) {
        throw new Error('La base de datos no retornó el pedido creado.')
      }

      handleGenerarComandaTicket(pedidoCreado, datosEfectivo)

      carritoHook.setCarrito([])
      clienteHook.limpiarDatosCliente()
      setBusquedaPos('')

      if (metodosPago.length > 0) {
        setMetodoPagoSeleccionado(metodosPago[0])
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error)
    } finally {
      setCobrando(false)
    }
  }

  const handleGuardarProductoEspecial = async (data: FormEspecialData) => {
    if (window.electronAPI?.crearProductoEspecial) {
      const creado = await window.electronAPI.crearProductoEspecial(data)
      if (creado) {
        await recargarMenu()
        setCategoriaActiva('ESPECIALES_HOY')
      }
    }
  }

  const handleToggleEspecial = async (productoId: string, esEspecial: boolean) => {
    if (window.electronAPI?.toggleEspecialProducto) {
      try {
        await window.electronAPI.toggleEspecialProducto(productoId, esEspecial)
      } catch (e) {
        console.error('Error al actualizar plato del día:', e)
      }
    }
    setCategorias((prev) =>
      prev.map((cat) => ({
        ...cat,
        productos: cat.productos.map((p) =>
          p.id === productoId ? { ...p, esEspecial } : p
        ),
      }))
    )
  }

  const handleDesactivarEspecial = async (productoId: string) => {
    if (window.electronAPI?.desactivarProductoEspecial) {
      await window.electronAPI.desactivarProductoEspecial(Number(productoId))
      await recargarMenu()
    }
  }

  const cargarBancosBD = async () => {
    if (window.electronAPI?.getBancos) {
      const bancosBD = await window.electronAPI.getBancos()
      if (Array.isArray(bancosBD)) {
        setBancos(bancosBD)
        if (bancosBD.length > 0 && !bancosBD.some((b) => b.id === bancoSeleccionado)) {
          setBancoSeleccionado(bancosBD[0].id)
        }
      }
    }
  }

  const adicionesDesdeBD =
    categorias
      .find(
        (c) =>
          c.nombre.toLowerCase().includes('porciones') ||
          c.nombre.toLowerCase().includes('adiciones')
      )
      ?.productos.map((p) => ({
        nombre: p.nombre.replace(/^Porción de\s+/i, ''),
        precio: p.precio,
      })) || []

  const normalizarTexto = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  const terminoBusqueda = normalizarTexto(busquedaPos)

  const productosActuales = terminoBusqueda
    ? categorias
        .flatMap((c) => c.productos)
        .filter((p) => {
          const enNombre = normalizarTexto(p.nombre).includes(terminoBusqueda)
          const enDesc = p.descripcion
            ? normalizarTexto(p.descripcion).includes(terminoBusqueda)
            : false
          return enNombre || enDesc
        })
    : categoriaActiva === 'ESPECIALES_HOY'
      ? categorias.flatMap((c) => c.productos).filter((p) => p.esEspecial)
      : categorias.find((c) => c.id === categoriaActiva)?.productos || []

  return {
    categorias,
    categoriaActiva,
    setCategoriaActiva,
    busquedaPos,
    setBusquedaPos,
    cobrando,
    tipoPedido,
    setTipoPedido,
    metodosPago,
    metodoPagoSeleccionado,
    setMetodoPagoSeleccionado,
    bancos,
    bancoSeleccionado,
    setBancoSeleccionado,
    mostrarModalNuevoEspecial,
    setMostrarModalNuevoEspecial,
    mostrarModalArchivados,
    setMostrarModalArchivados,
    mostrarModalEspeciales,
    setMostrarModalEspeciales,
    ticketParaImprimir,
    setTicketParaImprimir,
    productosActuales,
    adicionesDesdeBD,
    handleCobrar,
    handleGuardarProductoEspecial,
    handleToggleEspecial,
    handleDesactivarEspecial,
    cargarBancosBD,
    recargarMenu,
    ...clienteHook,
    ...carritoHook,
  }
}
