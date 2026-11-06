import { useState, useEffect, useCallback } from 'react'
import {
  FiltroEstadoVenta,
  MetricasVentas,
  ModoFiltroFecha,
  VentaResumen,
} from '@/types/ventas/ventas.types'
import { DatosComandaCocina } from '@/types/pos/posView.types'
import { Banco, MetodoPago } from '@/types/pos/pos'
import { useGastosCaja } from './useGastosCaja'

const formatearFechaLocal = (fecha: Date): string => {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useVentasHistorial = () => {
  const hoyStr = formatearFechaLocal(new Date())

  // Filtros de fecha
  const [modoFecha, setModoFecha] = useState<ModoFiltroFecha>('UNICA')
  const [fechaUnica, setFechaUnica] = useState<string>(hoyStr)
  const [fechaInicio, setFechaInicio] = useState<string>(hoyStr)
  const [fechaFin, setFechaFin] = useState<string>(hoyStr)

  // Filtros adicionales y paginación
  const [tipoPedidoFiltro, setTipoPedidoFiltro] = useState<string>('TODOS')
  const [filtroEstadoVenta, setFiltroEstadoVenta] = useState<FiltroEstadoVenta>('TODOS')
  const [bancoFiltro, setBancoFiltro] = useState<string>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  // Fila expandida para ver productos
  const [ventaExpandidaId, setVentaExpandidaId] = useState<number | null>(null)

  // Catálogo de métodos de pago y bancos para cambio de pago
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [bancos, setBancos] = useState<Banco[]>([])

  // Estado de Datos
  const [ventas, setVentas] = useState<VentaResumen[]>([])
  const [metricas, setMetricas] = useState<MetricasVentas>({
    totalMonto: 0,
    totalEfectivo: 0,
    totalBancos: 0,
    totalPedidos: 0,
    mesas: 0,
    llevar: 0,
    domicilios: 0,
  })

  // Modales y Estados de Carga
  const [cargando, setCargando] = useState(false)
  const [exportandoCsv, setExportandoCsv] = useState(false)
  const [modalRankingAbierto, setModalRankingAbierto] = useState(false)
  const [modalBancosAbierto, setModalBancosAbierto] = useState(false)
  const [ventaACambiarPago, setVentaACambiarPago] = useState<VentaResumen | null>(null)
  const [ventaAAnular, setVentaAAnular] = useState<VentaResumen | null>(null)
  const [motivoAnulacion, setMotivoAnulacion] = useState('Error de digitación en caja')
  const [otroMotivo, setOtroMotivo] = useState('')
  const [ventaADesanular, setVentaADesanular] = useState<VentaResumen | null>(null)
  const [ticketModalData, setTicketModalData] = useState<DatosComandaCocina | null>(null)

  useEffect(() => {
    const cargarMetodosYBancos = async () => {
      try {
        if (window.electronAPI?.getMetodosPago) {
          const m = await window.electronAPI.getMetodosPago()
          if (Array.isArray(m)) setMetodosPago(m.filter((x) => x.activo))
        }
        if (window.electronAPI?.getBancos) {
          const b = await window.electronAPI.getBancos()
          if (Array.isArray(b)) setBancos(b.filter((x) => x.activo))
        }
      } catch (err) {
        console.error('Error cargando bancos y métodos de pago:', err)
      }
    }
    cargarMetodosYBancos()
  }, [])

  // Función principal para consultar ventas y gastos filtrados desde el Backend
  const cargarVentas = useCallback(async () => {
    setCargando(true)

    const inicio = modoFecha === 'UNICA' ? fechaUnica : fechaInicio
    const fin = modoFecha === 'UNICA' ? fechaUnica : fechaFin

    try {
      if (window.electronAPI?.getVentasPaginadas) {
        const respuesta = await window.electronAPI.getVentasPaginadas({
          fechaInicio: inicio,
          fechaFin: fin,
          busqueda: busqueda.trim(),
          tipoPedido: tipoPedidoFiltro,
          estado: filtroEstadoVenta,
          bancoId: bancoFiltro,
          page: paginaActual,
          pageSize: 30,
        })

        if (respuesta) {
          setVentas(respuesta.datos || [])
          setTotalPaginas(respuesta.paginacion?.totalPaginas || 1)
          setTotalRegistros(respuesta.paginacion?.totalRegistros || 0)
          setMetricas(
            respuesta.metricas || {
              totalMonto: 0,
              totalEfectivo: 0,
              totalBancos: 0,
              totalPedidos: 0,
              mesas: 0,
              llevar: 0,
              domicilios: 0,
            }
          )
        }
      }

      await gastosHook.consultarTotalGastos(inicio, fin)
    } catch (error) {
      console.error('Error cargando ventas y gastos:', error)
    } finally {
      setCargando(false)
    }
  }, [
    modoFecha,
    fechaUnica,
    fechaInicio,
    fechaFin,
    busqueda,
    tipoPedidoFiltro,
    filtroEstadoVenta,
    bancoFiltro,
    paginaActual,
  ])

  const gastosHook = useGastosCaja({
    modoFecha,
    fechaUnica,
    fechaInicio,
    fechaFin,
    hoyStr,
    onRecargarArqueo: cargarVentas,
  })

  useEffect(() => {
    setPaginaActual(1)
  }, [
    modoFecha,
    fechaUnica,
    fechaInicio,
    fechaFin,
    busqueda,
    tipoPedidoFiltro,
    filtroEstadoVenta,
    bancoFiltro,
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarVentas()
    }, 250)

    return () => clearTimeout(timer)
  }, [cargarVentas])

  // Accesos rápidos de fecha
  const handleIrAHoy = () => {
    setModoFecha('UNICA')
    setFechaUnica(hoyStr)
  }

  const handleIrAAyer = () => {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    setModoFecha('UNICA')
    setFechaUnica(formatearFechaLocal(ayer))
  }

  const handleIrAEstaSemana = () => {
    const hoy = new Date()
    const dia = hoy.getDay()
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1)
    const primerDia = new Date(new Date().setDate(diff))
    setModoFecha('RANGO')
    setFechaInicio(formatearFechaLocal(primerDia))
    setFechaFin(hoyStr)
  }

  const handleIrAEsteMes = () => {
    const hoy = new Date()
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    setModoFecha('RANGO')
    setFechaInicio(formatearFechaLocal(primerDia))
    setFechaFin(hoyStr)
  }

  const toggleExpandir = (id: number) => {
    setVentaExpandidaId((prev) => (prev === id ? null : id))
  }

  const handleReimprimir = (venta: VentaResumen) => {
    const clienteData = venta.cliente
    const costoDomicilio = Number(venta.montoDomicilio || 0)
    const subtotalCalculado = venta.montoTotal - costoDomicilio

    const datosTicket: DatosComandaCocina = {
      consecutivo: venta.consecutivo,
      tipoPedido: venta.tipoPedido as any,
      fecha: `${venta.fecha} ${venta.hora || ''}`,
      hora: venta.hora || undefined,
      cliente:
        venta.nombreCliente || clienteData
          ? {
              nombre: clienteData?.nombre || venta.nombreCliente || 'Cliente Mostrador',
              telefono: clienteData?.telefono || '',
              direccion: clienteData?.direccion || undefined,
              referenciaDireccion: clienteData?.referenciaDireccion || undefined,
            }
          : undefined,
      items: (venta.items || []).map((item: any) => ({
        cantidad: item.cantidad,
        nombre: item.producto?.nombre || item.nombre || 'Producto',
        observaciones: item.observaciones || undefined,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
      })),
      subtotal: subtotalCalculado,
      costoDomicilio,
      total: venta.montoTotal,
      metodoPago: venta.metodoPago,
      bancoNombre: venta.bancoNombre || undefined,
      observacionesGenerales: venta.observacionesGenerales || undefined,
    }

    setTicketModalData(datosTicket)
  }

  const handleCerrarTicketModal = () => {
    setTicketModalData(null)
  }

  const handleAbrirAnulacion = (venta: VentaResumen) => {
    setVentaAAnular(venta)
    setMotivoAnulacion('Error de digitación en caja')
    setOtroMotivo('')
  }

  const handleConfirmarAnulacion = async () => {
    if (!ventaAAnular || !window.electronAPI?.anularVenta) return
    const motivoFinal =
      motivoAnulacion === 'OTRO' ? otroMotivo.trim() || 'Otro motivo' : motivoAnulacion
    setCargando(true)
    try {
      await window.electronAPI.anularVenta(ventaAAnular.id, motivoFinal)
      setVentaAAnular(null)
      await cargarVentas()
    } catch (error) {
      console.error('Error anulando venta:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleConfirmarDesanulacion = async () => {
    if (!ventaADesanular || !window.electronAPI?.desanularVenta) return
    setCargando(true)
    try {
      await window.electronAPI.desanularVenta(ventaADesanular.id)
      setVentaADesanular(null)
      await cargarVentas()
    } catch (error) {
      console.error('Error al desanular venta:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleConfirmarCambioPago = async (data: {
    pedidoId: number
    metodoPago: string
    bancoId?: string | null
  }) => {
    if (!window.electronAPI?.cambiarMetodoPagoVenta) return
    await window.electronAPI.cambiarMetodoPagoVenta(data)
    await cargarVentas()
  }

  const handleExportarCsv = async () => {
    if (!window.electronAPI?.exportarReporteCsv) return
    const inicio = modoFecha === 'UNICA' ? fechaUnica : fechaInicio
    const fin = modoFecha === 'UNICA' ? fechaUnica : fechaFin

    setExportandoCsv(true)
    try {
      await window.electronAPI.exportarReporteCsv({
        fechaInicio: inicio,
        fechaFin: fin,
        busqueda: busqueda.trim(),
        tipoPedido: tipoPedidoFiltro,
        estado: filtroEstadoVenta,
        bancoId: bancoFiltro,
      })
    } catch (error) {
      console.error('Error exportando reporte CSV:', error)
    } finally {
      setExportandoCsv(false)
    }
  }

  const nombreBancoFiltro =
    bancoFiltro !== 'TODOS'
      ? metricas.desgloseBancos?.find((b) => b.bancoId === bancoFiltro)?.nombre ||
        bancos.find((b) => b.id === bancoFiltro)?.nombre ||
        bancoFiltro
      : undefined

  return {
    modoFecha,
    setModoFecha,
    fechaUnica,
    setFechaUnica,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    tipoPedidoFiltro,
    setTipoPedidoFiltro,
    filtroEstadoVenta,
    setFiltroEstadoVenta,
    bancoFiltro,
    setBancoFiltro,
    nombreBancoFiltro,
    busqueda,
    setBusqueda,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    totalRegistros,
    ventasFiltradas: ventas,
    metricas,
    metodosPago,
    bancos,
    cargando,
    exportandoCsv,
    modalRankingAbierto,
    setModalRankingAbierto,
    modalBancosAbierto,
    setModalBancosAbierto,
    ventaACambiarPago,
    setVentaACambiarPago,
    ventaAAnular,
    setVentaAAnular,
    handleAbrirAnulacion,
    motivoAnulacion,
    setMotivoAnulacion,
    otroMotivo,
    setOtroMotivo,
    ventaADesanular,
    setVentaADesanular,
    ticketModalData,
    ventaExpandidaId,
    toggleExpandir,
    handleIrAHoy,
    handleIrAAyer,
    handleIrAEstaSemana,
    handleIrAEsteMes,
    handleReimprimir,
    handleCerrarTicketModal,
    handleConfirmarAnulacion,
    handleConfirmarDesanulacion,
    handleConfirmarCambioPago,
    handleExportarCsv,
    recargarVentas: cargarVentas,
    ...gastosHook,
  }
}
