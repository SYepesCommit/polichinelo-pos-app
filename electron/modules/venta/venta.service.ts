import { FiltrosHistorial } from '@/types/ventas/ventas.types'
import { prisma } from '../../config/database'
import { dialog } from 'electron'
import fs from 'node:fs'

function getRangoUTC5(fechaInicioStr: string, fechaFinStr?: string) {
  const finStr = fechaFinStr || fechaInicioStr
  // Jornada operativa con margen de madrugada (corte 04:00 a.m. hora Colombia)
  const inicio = new Date(`${fechaInicioStr}T04:00:00-05:00`)
  const baseFin = new Date(`${finStr}T00:00:00-05:00`)
  const fin = new Date(baseFin.getTime() + 28 * 60 * 60 * 1000 - 1)
  return { inicio, fin }
}

function escaparCsv(valor: any): string {
  if (valor === null || valor === undefined) return '""'
  const str = String(valor).replace(/"/g, '""')
  return `"${str}"`
}

export const ventaService = {
  // 1. Consulta por FECHA ÚNICA
  async getVentasPorFecha(fechaStr: string) {
    try {
      const { inicio, fin } = getRangoUTC5(fechaStr)

      const pedidos = await prisma.pedido.findMany({
        where: {
          fechaRegistro: {
            gte: inicio,
            lte: fin,
          },
        },
        include: {
          cliente: true,
          detalles: {
            include: { producto: true },
          },
          pagos: {
            include: { banco: true },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      })

      return this.mapearRespuestaVentas(pedidos)
    } catch (error) {
      console.error('Error al obtener ventas por fecha:', error)
      throw error
    }
  },

  // 2. Consulta por RANGO DE FECHAS
  async getVentasPorRango(fechaInicioStr: string, fechaFinStr: string) {
    try {
      const { inicio, fin } = getRangoUTC5(fechaInicioStr, fechaFinStr)

      const pedidos = await prisma.pedido.findMany({
        where: {
          fechaRegistro: {
            gte: inicio,
            lte: fin,
          },
        },
        include: {
          cliente: true,
          detalles: {
            include: { producto: true },
          },
          pagos: {
            include: { banco: true },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      })
      return this.mapearRespuestaVentas(pedidos)
    } catch (error) {
      console.error('Error al obtener ventas por rango:', error)
      throw error
    }
  },

  // 3. Anulación de venta con motivo
  async anularVenta(pedidoId: number, motivo?: string) {
    try {
      return await prisma.pedido.update({
        where: { id: Number(pedidoId) },
        data: {
          estado: 'ANULADO',
          motivoAnulacion: motivo?.trim() || 'Anulado desde POS',
        },
      })
    } catch (error) {
      console.error('Error al anular venta:', error)
      throw error
    }
  },

  // 4. Reversión de anulación
  async revertirAnulacionVenta(pedidoId: number) {
    try {
      return await prisma.pedido.update({
        where: { id: Number(pedidoId) },
        data: {
          estado: 'REALIZADO',
          motivoAnulacion: null,
        },
      })
    } catch (error) {
      console.error('Error al revertir anulación de venta:', error)
      throw error
    }
  },

  // 5. Cambiar método de pago de una venta existente
  async cambiarMetodoPagoVenta(data: {
    pedidoId: number
    metodoPago: string
    bancoId?: string | null
  }) {
    try {
      const idNum = Number(data.pedidoId)
      const pedido = await prisma.pedido.findUnique({
        where: { id: idNum },
        include: { pagos: true },
      })

      if (!pedido) {
        throw new Error('El pedido no existe.')
      }

      const bancoIdFinal = data.bancoId && data.bancoId.trim() ? data.bancoId.trim() : null

      return await prisma.$transaction(async (tx) => {
        if (pedido.pagos.length > 0) {
          await tx.pagoDetalle.update({
            where: { id: pedido.pagos[0].id },
            data: {
              metodoPago: data.metodoPago,
              bancoId: bancoIdFinal,
            },
          })
        } else {
          await tx.pagoDetalle.create({
            data: {
              pedidoId: idNum,
              metodoPago: data.metodoPago,
              bancoId: bancoIdFinal,
              monto: pedido.total,
            },
          })
        }

        return { ok: true }
      })
    } catch (error) {
      console.error('Error al cambiar método de pago de la venta:', error)
      throw error
    }
  },

  // 6. Exportar reporte completo a CSV (compatible con Excel en español)
  async exportarReporteCsv(filtros: FiltrosHistorial) {
    try {
      const { fechaInicio, fechaFin } = filtros
      const nombreSugerido =
        fechaInicio === fechaFin
          ? `Reporte_Polichinelo_${fechaInicio}.csv`
          : `Reporte_Polichinelo_${fechaInicio}_a_${fechaFin}.csv`

      const saveResult = await dialog.showSaveDialog({
        title: 'Exportar Reporte de Ventas y Arqueo (Excel / CSV)',
        defaultPath: nombreSugerido,
        filters: [{ name: 'Archivo Excel CSV', extensions: ['csv'] }],
      })

      if (saveResult.canceled || !saveResult.filePath) {
        return { ok: false, cancelado: true }
      }

      const reporte = await this.getVentasPaginadas({
        ...filtros,
        page: 1,
        pageSize: 100000,
      })

      const { inicio, fin } = getRangoUTC5(fechaInicio, fechaFin)
      const gastos = await prisma.gasto.findMany({
        where: {
          fechaRegistro: { gte: inicio, lte: fin },
        },
        orderBy: { fechaRegistro: 'desc' },
      })

      const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0)
      const totalGastosEfectivo = gastos.reduce((acc, g) => {
        const esTransf = (g.descripcion || '').trim().toUpperCase().startsWith('[TRANSFERENCIA]')
        return esTransf ? acc : acc + Number(g.monto || 0)
      }, 0)
      const totalGastosTransferencia = totalGastos - totalGastosEfectivo
      const m = reporte.metricas

      const lineas: string[] = []
      // BOM UTF-8 + sep=; para que Excel en español abra columnas automáticamente
      lineas.push('sep=;')
      lineas.push(`"REPORTE DE VENTAS Y ARQUEO - POLICHINELO POS"`)
      lineas.push(`"Periodo";${escaparCsv(`${fechaInicio} al ${fechaFin}`)}`)
      lineas.push('')

      // SECCIÓN 1: RESUMEN FINANCIERO
      lineas.push('"1. RESUMEN DE ARQUEO Y CAJA"')
      lineas.push('"Concepto";"Valor (COP)"')
      lineas.push(`"Total Facturado (Ventas Activas)";${m.totalMonto}`)
      lineas.push(`"Ingresos en Efectivo";${m.totalEfectivo}`)
      lineas.push(`"Ingresos en Bancos / Transferencias";${m.totalBancos}`)
      lineas.push(`"Salidas en Efectivo (Caja)";${totalGastosEfectivo}`)
      lineas.push(`"Salidas por Transferencia / Banco";${totalGastosTransferencia}`)
      lineas.push(`"Total Salidas / Gastos";${totalGastos}`)
      lineas.push(`"Efectivo Neto Esperado en Caja";${m.totalEfectivo - totalGastosEfectivo}`)
      lineas.push(`"Total Recargos de Domicilios (${m.domicilios} envios)";${m.totalDomiciliosMonto}`)
      lineas.push('')

      // SECCIÓN 2: DESGLOSE POR BANCO
      lineas.push('"2. DESGLOSE POR BANCO / ENTIDAD"')
      lineas.push('"Banco / Entidad";"Cantidad Transacciones";"Total Recibido (COP)"')
      if (m.desgloseBancos.length === 0) {
        lineas.push('"Sin pagos bancarios en este periodo";0;0')
      } else {
        for (const b of m.desgloseBancos) {
          lineas.push(`${escaparCsv(b.nombre)};${b.cantidadPedidos};${b.totalMonto}`)
        }
      }
      lineas.push('')

      // SECCIÓN 3: RANKING DE PRODUCTOS MÁS VENDIDOS
      lineas.push('"3. RANKING DE PRODUCTOS VENDIDOS"')
      lineas.push('"Posicion";"Producto";"Categoria";"Unidades Vendidas";"Total Generado (COP)";"Utilidad Estimada (COP)"')
      m.rankingProductos.forEach((p, idx) => {
        lineas.push(
          `${idx + 1};${escaparCsv(p.nombre)};${escaparCsv(p.categoriaNombre)};${p.cantidadVendida};${p.totalGenerado};${p.gananciaEstimada}`
        )
      })
      lineas.push('')

      // SECCIÓN 4: SALIDAS / GASTOS DE CAJA
      lineas.push('"4. SALIDAS Y GASTOS DE CAJA"')
      lineas.push('"ID";"Fecha";"Hora";"Origen";"Concepto / Motivo";"Monto (COP)"')
      gastos.forEach((g) => {
        const fechaObjGasto = new Date(g.fechaRegistro)
        const fechaGasto = fechaObjGasto.toLocaleDateString('en-CA', {
          timeZone: 'America/Bogota',
        })
        const horaGasto = fechaObjGasto.toLocaleTimeString('es-CO', {
          timeZone: 'America/Bogota',
          hour: '2-digit',
          minute: '2-digit',
        })
        const rawDesc = (g.descripcion || '').trim()
        const esTransf = rawDesc.toUpperCase().startsWith('[TRANSFERENCIA]')
        const descLimpia = rawDesc.replace(/^\[(TRANSFERENCIA|EFECTIVO)\]\s*/i, '').trim()
        lineas.push(
          `${g.id};${escaparCsv(fechaGasto)};${escaparCsv(horaGasto)};${escaparCsv(
            esTransf ? 'Transferencia' : 'Efectivo Caja'
          )};${escaparCsv(descLimpia)};${g.monto}`
        )
      })
      lineas.push('')

      // SECCIÓN 5: LISTADO DETALLADO DE PEDIDOS
      lineas.push('"5. LISTADO DETALLADO DE VENTAS"')
      lineas.push(
        '"Consecutivo";"Fecha";"Hora";"Estado";"Tipo Pedido";"Cliente";"Telefono";"Direccion";"Metodo Pago";"Banco";"Valor Domicilio";"Total Pedido";"Detalle Productos";"Observaciones / Motivo Anulacion"'
      )
      reporte.datos.forEach((v: any) => {
        const resumenItems = (v.items || [])
          .map((it: any) => `${it.cantidad}x ${it.nombre}`)
          .join(' | ')
        const notaOMotivo =
          v.estado === 'ANULADO'
            ? `ANULADO: ${v.motivoAnulacion || ''}`
            : v.observacionesGenerales || ''

        lineas.push(
          [
            escaparCsv(`#${v.consecutivo}`),
            escaparCsv(v.fecha),
            escaparCsv(v.hora),
            escaparCsv(v.estado),
            escaparCsv(v.tipoPedido),
            escaparCsv(v.nombreCliente),
            escaparCsv(v.cliente?.telefono || ''),
            escaparCsv(v.cliente?.direccion || ''),
            escaparCsv(v.metodoPago),
            escaparCsv(v.bancoNombre || ''),
            v.montoDomicilio || 0,
            v.montoTotal,
            escaparCsv(resumenItems),
            escaparCsv(notaOMotivo),
          ].join(';')
        )
      })

      const contenidoFinal = '\uFEFF' + lineas.join('\r\n')
      fs.writeFileSync(saveResult.filePath, contenidoFinal, 'utf-8')

      return { ok: true, filePath: saveResult.filePath }
    } catch (error: any) {
      console.error('Error exportando reporte CSV:', error)
      return { ok: false, error: error.message || 'Error al exportar CSV' }
    }
  },

  // 7. Mapeo formateado para la interfaz de ventas con ítems completos
  mapearRespuestaVentas(pedidos: any[]) {
    return pedidos.map((p) => {
      const primerPago = p.pagos && p.pagos.length > 0 ? p.pagos[0] : null
      const fechaObj = new Date(p.fechaRegistro)

      const fechaColombia = fechaObj.toLocaleDateString('en-CA', {
        timeZone: 'America/Bogota',
      })

      let snapshotDestino: any = null
      if (typeof p.detallesDestino === 'string' && p.detallesDestino.trim().startsWith('{')) {
        try {
          snapshotDestino = JSON.parse(p.detallesDestino)
        } catch {
          snapshotDestino = null
        }
      }

      const nombreResuelto =
        snapshotDestino?.nombre ||
        p.cliente?.nombre ||
        (typeof p.detallesDestino === 'string' && !p.detallesDestino.trim().startsWith('{')
          ? p.detallesDestino
          : '') ||
        'Cliente'

      const clienteResumen =
        snapshotDestino || p.cliente
          ? {
              nombre: nombreResuelto,
              telefono: snapshotDestino?.telefono || p.cliente?.telefono || '',
              direccion: snapshotDestino?.direccion || p.cliente?.direccion || '',
              referenciaDireccion:
                snapshotDestino?.referenciaDireccion ||
                p.cliente?.referenciaDireccion ||
                '',
            }
          : p.detallesDestino
          ? {
              nombre: nombreResuelto,
              telefono: '',
              direccion: '',
              referenciaDireccion: '',
            }
          : undefined

      return {
        id: p.id,
        consecutivo: String(p.id).padStart(6, '0'),
        fecha: fechaColombia,
        hora: fechaObj.toLocaleTimeString('es-CO', {
          timeZone: 'America/Bogota',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        tipoPedido: p.tipoPedido,
        nombreCliente: nombreResuelto,
        cliente: clienteResumen,
        observacionesGenerales: p.observacionesGenerales || undefined,
        detallesDestino: nombreResuelto,
        montoDomicilio: Number(p.montoDomicilio || 0),
        montoTotal: Number(p.total),
        montoRecibido:
          snapshotDestino?.montoRecibido !== undefined
            ? Number(snapshotDestino.montoRecibido)
            : undefined,
        cambio:
          snapshotDestino?.cambio !== undefined ? Number(snapshotDestino.cambio) : undefined,
        metodoPago: primerPago?.metodoPago || 'Efectivo',
        bancoId: primerPago?.bancoId || null,
        bancoNombre: primerPago?.banco?.nombre || primerPago?.bancoId || null,
        estado: p.estado || 'REALIZADO',
        motivoAnulacion: p.motivoAnulacion || null,
        items: (p.detalles || []).map((d: any) => ({
          id: d.id,
          productoId: d.productoId,
          nombre: d.producto?.nombre || 'Producto',
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
          observaciones: d.observaciones,
          producto: d.producto
            ? {
                id: d.producto.id,
                nombre: d.producto.nombre,
              }
            : undefined,
        })),
      }
    })
  },

  async desanularVenta(id: number) {
    try {
      const pedidoExistente = await prisma.pedido.findUnique({
        where: { id },
      })

      if (!pedidoExistente) {
        throw new Error('El pedido no existe.')
      }

      if (pedidoExistente.estado !== 'ANULADO') {
        throw new Error('Solo se pueden desanular pedidos que estén en estado ANULADO.')
      }

      const pedidoRestaurado = await prisma.pedido.update({
        where: { id },
        data: {
          estado: 'REALIZADO',
          motivoAnulacion: null,
        },
      })

      return pedidoRestaurado
    } catch (error) {
      console.error('Error al desanular venta:', error)
      throw error
    }
  },

  async getVentasPaginadas(filtros: FiltrosHistorial) {
    const {
      fechaInicio,
      fechaFin,
      busqueda = '',
      tipoPedido = 'TODOS',
      estado = 'TODOS',
      bancoId = 'TODOS',
      page = 1,
      pageSize = 30,
    } = filtros

    const skip = (page - 1) * pageSize
    const { inicio, fin } = getRangoUTC5(fechaInicio, fechaFin)

    const where: any = {
      fechaRegistro: {
        gte: inicio,
        lte: fin,
      },
    }

    if (tipoPedido !== 'TODOS') {
      where.tipoPedido = tipoPedido
    }

    if (estado !== 'TODOS') {
      if (estado === 'REALIZADOS' || estado === 'COMPLETADOS') {
        where.estado = { not: 'ANULADO' }
      } else if (estado === 'ANULADOS') {
        where.estado = 'ANULADO'
      } else {
        where.estado = estado
      }
    }

    if (bancoId && bancoId !== 'TODOS') {
      if (bancoId === 'SIN_BANCO') {
        where.pagos = {
          some: {
            bancoId: null,
            NOT: {
              metodoPago: { contains: 'EFECTIVO' },
            },
          },
        }
      } else {
        where.pagos = {
          some: {
            bancoId,
          },
        }
      }
    }

    if (busqueda.trim()) {
      const q = busqueda.trim()
      const esNumero = !isNaN(Number(q))

      where.OR = [
        ...(esNumero ? [{ id: Number(q) }] : []),
        { cliente: { nombre: { contains: q } } },
        { cliente: { telefono: { contains: q } } },
        { detallesDestino: { contains: q } },
      ]
    }

    // Condición global del período para el Arqueo de Caja (independiente de filtros de búsqueda de la tabla inferior)
    const wherePeriodoActivos = {
      fechaRegistro: where.fechaRegistro,
      estado: { not: 'ANULADO' },
    }

    const [
      pedidos,
      totalRegistros,
      agregados,
      agregadoDomicilios,
      conteoPorTipo,
      pagosAgrupados,
      bancosCatalogo,
      productosAgrupados,
      productosCatalogo,
    ] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
        include: {
          cliente: true,
          detalles: {
            include: { producto: true },
          },
          pagos: {
            include: { banco: true },
          },
        },
      }),

      prisma.pedido.count({ where }),

      prisma.pedido.aggregate({
        where: wherePeriodoActivos,
        _sum: { total: true },
      }),

      prisma.pedido.aggregate({
        where: {
          ...wherePeriodoActivos,
          tipoPedido: 'DOMICILIO',
        },
        _sum: { montoDomicilio: true },
      }),

      prisma.pedido.groupBy({
        by: ['tipoPedido'],
        where: wherePeriodoActivos,
        _count: { _all: true },
      }),

      prisma.pagoDetalle.groupBy({
        by: ['metodoPago', 'bancoId'],
        where: {
          pedido: wherePeriodoActivos,
        },
        _sum: { monto: true },
        _count: { _all: true },
      }),

      prisma.banco.findMany({
        select: { id: true, nombre: true },
      }),

      prisma.pedidoDetalle.groupBy({
        by: ['productoId'],
        where: {
          pedido: wherePeriodoActivos,
        },
        _sum: {
          cantidad: true,
          subtotal: true,
        },
      }),

      prisma.producto.findMany({
        select: {
          id: true,
          nombre: true,
          costoBase: true,
          categoria: {
            select: { nombre: true },
          },
        },
      }),
    ])

    const resumenTipos = { MESA: 0, LLEVAR: 0, DOMICILIO: 0 }
    conteoPorTipo.forEach((t) => {
      if (t.tipoPedido in resumenTipos) {
        resumenTipos[t.tipoPedido as keyof typeof resumenTipos] = t._count._all
      }
    })

    const mapaNombresBancos = new Map<string, string>(
      bancosCatalogo.map((b) => [b.id, b.nombre])
    )

    let totalEfectivo = 0
    let totalBancos = 0
    const mapaBancos = new Map<
      string,
      { bancoId: string; nombre: string; totalMonto: number; cantidadPedidos: number }
    >()

    pagosAgrupados.forEach((grupo) => {
      const montoGrupo = Number(grupo._sum.monto || 0)
      const conteoGrupo = Number(grupo._count._all || 0)

      if (grupo.metodoPago.toUpperCase().includes('EFECTIVO')) {
        totalEfectivo += montoGrupo
      } else {
        totalBancos += montoGrupo
        const claveBanco = grupo.bancoId || 'SIN_BANCO'
        const nombreBanco =
          (grupo.bancoId ? mapaNombresBancos.get(grupo.bancoId) : undefined) ||
          (grupo.bancoId ? grupo.bancoId.toUpperCase() : 'Sin entidad asignada')

        const existente = mapaBancos.get(claveBanco)
        if (existente) {
          existente.totalMonto += montoGrupo
          existente.cantidadPedidos += conteoGrupo
        } else {
          mapaBancos.set(claveBanco, {
            bancoId: claveBanco,
            nombre: nombreBanco,
            totalMonto: montoGrupo,
            cantidadPedidos: conteoGrupo,
          })
        }
      }
    })

    const desgloseBancos = Array.from(mapaBancos.values()).sort(
      (a, b) => b.totalMonto - a.totalMonto
    )

    const mapaInfoProductos = new Map(
      productosCatalogo.map((p) => [
        p.id,
        {
          nombre: p.nombre,
          categoriaNombre: p.categoria?.nombre || 'Varios',
          costoBase: Number(p.costoBase || 0),
        },
      ])
    )

    let totalUnidadesVendidas = 0
    const rankingProductos = productosAgrupados
      .map((grupo) => {
        const cant = Number(grupo._sum.cantidad || 0)
        const subtotalGrupo = Number(grupo._sum.subtotal || 0)
        totalUnidadesVendidas += cant

        const info = grupo.productoId !== null ? mapaInfoProductos.get(grupo.productoId) : undefined
        const nombreProd = info?.nombre || 'Ítem Libre / Varios'
        const catNombre = info?.categoriaNombre || 'Varios'
        const costoUnitario = info?.costoBase || 0
        const gananciaEstimada = costoUnitario > 0 ? subtotalGrupo - costoUnitario * cant : 0

        return {
          productoId: grupo.productoId ?? null,
          nombre: nombreProd,
          categoriaNombre: catNombre,
          cantidadVendida: cant,
          totalGenerado: subtotalGrupo,
          gananciaEstimada,
        }
      })
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida || b.totalGenerado - a.totalGenerado)

    return {
      datos: this.mapearRespuestaVentas(pedidos),
      paginacion: {
        totalRegistros,
        totalPaginas: Math.ceil(totalRegistros / pageSize) || 1,
        paginaActual: page,
        pageSize,
      },
      metricas: {
        totalMonto: agregados._sum.total || 0,
        totalEfectivo,
        totalBancos,
        totalPedidos: totalRegistros,
        mesas: resumenTipos.MESA,
        llevar: resumenTipos.LLEVAR,
        domicilios: resumenTipos.DOMICILIO,
        totalDomiciliosMonto: Number(agregadoDomicilios._sum.montoDomicilio || 0),
        totalUnidadesVendidas,
        rankingProductos,
        desgloseBancos,
      },
    }
  },
}
