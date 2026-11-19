import { useState, useEffect } from 'react'
import {
  Banco,
  Categoria,
  DetallePedidoInput,
  ItemCarrito,
  MetodoPago,
  PagoInput,
  TipoPedido,
} from '../../types/pos/pos'
import { DatosComandaCocina, FormEspecialData } from '../../types/pos/posView.types'
import { DatosCobroEfectivoOMixto } from '../../types/pos/comandaPanel.types'
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

  // Modales de Especiales, WhatsApp y Tiquete
  const [mostrarModalNuevoEspecial, setMostrarModalNuevoEspecial] = useState(false)
  const [mostrarModalArchivados, setMostrarModalArchivados] = useState(false)
  const [mostrarModalEspeciales, setMostrarModalEspeciales] = useState(false)
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false)
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
    datosCobro?: DatosCobroEfectivoOMixto
  ) => {
    if (carritoHook.carrito.length === 0 && !pedidoRespuesta) return

    const itemsFormateados = (pedidoRespuesta?.detalles || carritoHook.carrito).map((item: any) => ({
      nombre: item.producto?.nombre || item.nombre || 'Ítem',
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario || item.producto?.precio || 0,
      subtotal: item.subtotal || (item.producto?.precio || 0) * item.cantidad,
      observaciones: item.observaciones || '',
    }))

    const bancoObj = bancos.find((b) => b.id === bancoSeleccionado)
    const esMixto = Boolean(datosCobro?.esMixto)

    const pagosTicket = esMixto
      ? [
          {
            metodoPago: 'TRANSFERENCIA',
            monto: Number(datosCobro?.montoTransferenciaMixto || 0),
            bancoNombre: bancoObj?.nombre || bancoSeleccionado,
          },
          {
            metodoPago: 'EFECTIVO',
            monto: Number(datosCobro?.montoEfectivoMixto || 0),
          },
        ]
      : undefined

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
      metodoPago: esMixto ? 'MIXTO' : metodoPagoSeleccionado?.nombre || 'EFECTIVO',
      bancoNombre:
        esMixto || metodoPagoSeleccionado?.requiereBanco ? bancoObj?.nombre : undefined,
      montoRecibido: datosCobro?.montoRecibido,
      cambio: datosCobro?.cambio,
      pagos: pagosTicket,
    }

    setTicketParaImprimir(comandaData)
    return comandaData
  }

  const handleCobrar = async (datosCobro?: DatosCobroEfectivoOMixto) => {
    const esMixto = Boolean(datosCobro?.esMixto)
    if (cobrando || carritoHook.carrito.length === 0 || (!metodoPagoSeleccionado && !esMixto))
      return
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
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        observaciones: item.observaciones || undefined,
      }))

      const pagosPayload: PagoInput[] = esMixto
        ? [
            {
              metodoPago: 'TRANSFERENCIA',
              bancoId: bancoSeleccionado || undefined,
              monto: Number(datosCobro?.montoTransferenciaMixto || 0),
            },
            {
              metodoPago: 'EFECTIVO',
              monto: Number(datosCobro?.montoEfectivoMixto || 0),
            },
          ]
        : [
            {
              metodoPagoId: metodoPagoSeleccionado!.id,
              metodoPago: metodoPagoSeleccionado!.codigo || metodoPagoSeleccionado!.nombre,
              bancoId: metodoPagoSeleccionado!.requiereBanco ? bancoSeleccionado : undefined,
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
        montoRecibido: datosCobro?.montoRecibido,
        cambio: datosCobro?.cambio,
      }

      if (!window.electronAPI?.crearPedido) {
        throw new Error('API de Electron no disponible')
      }
      const pedidoCreado = await window.electronAPI.crearPedido(payload)
      if (!pedidoCreado) {
        throw new Error('La base de datos no retornó el pedido creado.')
      }

      handleGenerarComandaTicket(pedidoCreado, datosCobro)

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

  const handleAplicarPedidoWhatsApp = (datos: {
    tipoPedido: TipoPedido
    nombreCliente: string
    telefono: string
    direccion: string
    referencia: string
    montoDomicilio?: number
    metodoPagoTexto?: 'EFECTIVO' | 'TRANSFERENCIA' | null
    bancoId?: string | null
    items: ItemCarrito[]
  }) => {
    setTipoPedido(datos.tipoPedido)
    if (datos.nombreCliente) clienteHook.setNombreCliente(datos.nombreCliente)
    if (datos.telefono) clienteHook.setTelefono(datos.telefono)
    if (datos.direccion) clienteHook.setDireccionCliente(datos.direccion)
    if (datos.referencia) clienteHook.setReferenciaCliente(datos.referencia)
    if (datos.montoDomicilio && datos.montoDomicilio > 0) {
      clienteHook.setMontoDomicilio(datos.montoDomicilio)
    }

    if (datos.metodoPagoTexto && metodosPago.length > 0) {
      const mpEncontrado = metodosPago.find((m) =>
        datos.metodoPagoTexto === 'TRANSFERENCIA'
          ? m.requiereBanco || m.codigo.toUpperCase().includes('TRANSFERENCIA')
          : m.codigo.toUpperCase().includes('EFECTIVO')
      )
      if (mpEncontrado) setMetodoPagoSeleccionado(mpEncontrado)
    }
    if (datos.bancoId) {
      setBancoSeleccionado(datos.bancoId)
    }

    if (datos.items.length > 0) {
      carritoHook.setCarrito((prev) => [...prev, ...datos.items])
    }
  }

  const handlePegarTelefonoRapido = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (!clip) return
      const match = clip.match(/(?:\+?57\s*)?(3\d{2}[\s.\-]?\d{3}[\s.\-]?\d{4})\b/)
      const soloDigitos = match && match[1] ? match[1].replace(/\D/g, '') : clip.replace(/\D/g, '')
      if (soloDigitos.length >= 7) {
        const telFinal = soloDigitos.length > 10 && soloDigitos.startsWith('57')
          ? soloDigitos.slice(2, 12)
          : soloDigitos.slice(0, 10)
        setTipoPedido('DOMICILIO')
        clienteHook.setTelefono(telFinal)
      }
    } catch (error) {
      console.error('Error al pegar teléfono del portapapeles:', error)
    }
  }

  const handleRepetirUltimoPedido = () => {
    const ultimo = clienteHook.ultimoPedidoCliente
    if (!ultimo || !Array.isArray(ultimo.items) || ultimo.items.length === 0) return

    const todosProductos = categorias.flatMap((c) => c.productos)

    const nuevosItems: ItemCarrito[] = ultimo.items.map((it, idx) => {
      const prodCatalogo = todosProductos.find((p) => String(p.id) === String(it.productoId))
      const extraGuardado = Math.max(0, (it.precioUnitario || 0) - (it.precioBase || 0))
      const precioBaseActual = prodCatalogo ? prodCatalogo.precio : it.precioBase || it.precioUnitario
      const precioFinal = precioBaseActual + extraGuardado

      return {
        idTemp: `rep-${it.productoId}-${Date.now()}-${idx}`,
        producto: prodCatalogo
          ? {
              ...prodCatalogo,
              precioBase: precioBaseActual,
              precio: precioFinal,
            }
          : {
              id: it.productoId || 'item-libre',
              nombre: it.nombre,
              precio: it.precioUnitario,
              precioBase: it.precioBase || it.precioUnitario,
            },
        cantidad: it.cantidad,
        observaciones: it.observaciones || '',
      }
    })

    carritoHook.setCarrito((prev) => [...prev, ...nuevosItems])
    if (
      tipoPedido === 'DOMICILIO' &&
      (!clienteHook.montoDomicilio || clienteHook.montoDomicilio === 0) &&
      ultimo.montoDomicilio > 0
    ) {
      clienteHook.setMontoDomicilio(ultimo.montoDomicilio)
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
        nombre: p.nombre
          .replace(/^Porción de\s+/i, '')
          .replace(/\s*\(3\s*Huevitos?\)/i, '')
          .replace(/\s*x3\b/i, '')
          .trim(),
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
    mostrarModalWhatsApp,
    setMostrarModalWhatsApp,
    ticketParaImprimir,
    setTicketParaImprimir,
    productosActuales,
    adicionesDesdeBD,
    handleCobrar,
    handleGuardarProductoEspecial,
    handleToggleEspecial,
    handleDesactivarEspecial,
    handleAplicarPedidoWhatsApp,
    handlePegarTelefonoRapido,
    handleRepetirUltimoPedido,
    cargarBancosBD,
    recargarMenu,
    ...clienteHook,
    ...carritoHook,
  }
}
