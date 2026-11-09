import { prisma } from '../../config/database'

const PREFIJO_TRANSF = '[TRANSFERENCIA] '

export class GastosService {
  private static getRangoUTC5(fechaInicioStr: string, fechaFinStr?: string) {
    const finStr = fechaFinStr || fechaInicioStr
    // Jornada operativa: desde las 04:00 a.m. del día inicial hasta las 03:59:59.999 a.m. del día siguiente al final
    const inicio = new Date(`${fechaInicioStr}T04:00:00-05:00`)
    const baseFin = new Date(`${finStr}T00:00:00-05:00`)
    const fin = new Date(baseFin.getTime() + 28 * 60 * 60 * 1000 - 1)
    return { inicio, fin }
  }

  static parsearDescripcionGasto(descripcionRaw: string) {
    const raw = (descripcionRaw || '').trim()
    if (raw.toUpperCase().startsWith('[TRANSFERENCIA]')) {
      return {
        origenFondos: 'TRANSFERENCIA' as const,
        descripcionLimpia: raw.replace(/^\[TRANSFERENCIA\]\s*/i, '').trim() || 'Salida por transferencia',
      }
    }
    return {
      origenFondos: 'EFECTIVO' as const,
      descripcionLimpia: raw.replace(/^\[EFECTIVO\]\s*/i, '').trim() || 'Salida de caja',
    }
  }

  // Registrar gasto
  static async registrarGasto(datos: {
    concepto: string
    monto: number
    fecha: string
    origenFondos?: 'EFECTIVO' | 'TRANSFERENCIA'
  }) {
    try {
      const { concepto, monto, fecha, origenFondos = 'EFECTIVO' } = datos
      const ahora = new Date()
      const fechaJornadaRef = new Date(ahora.getTime() - 4 * 60 * 60 * 1000)
      const hoyJornadaColombia = fechaJornadaRef.toLocaleDateString('en-CA', {
        timeZone: 'America/Bogota',
      })

      let fechaParaGuardar: Date
      if (!fecha || fecha === hoyJornadaColombia) {
        // Si pertenece a la jornada actual, guardar el instante exacto real
        fechaParaGuardar = ahora
      } else {
        // Si se registra manualmente en una fecha pasada/distinta del calendario, guardar dentro de esa jornada (18:00 UTC-5)
        fechaParaGuardar = new Date(`${fecha}T18:00:00-05:00`)
      }

      const conceptoLimpio = concepto.trim()
      const descripcionFinal =
        origenFondos === 'TRANSFERENCIA'
          ? `${PREFIJO_TRANSF}${conceptoLimpio}`
          : conceptoLimpio

      const nuevoGasto = await prisma.gasto.create({
        data: {
          descripcion: descripcionFinal,
          monto: Number(monto),
          fechaRegistro: fechaParaGuardar,
        },
      })

      return { success: true, id: nuevoGasto.id }
    } catch (error) {
      console.error('Error al registrar gasto:', error)
      return { success: false, error: 'No se pudo guardar el gasto' }
    }
  }

  // Suma total para las tarjetas de métricas (separando efectivo vs transferencia)
  static async getGastosRango(fechaInicio: string, fechaFin: string) {
    const { inicio, fin } = this.getRangoUTC5(fechaInicio, fechaFin)

    const gastos = await prisma.gasto.findMany({
      where: {
        fechaRegistro: { gte: inicio, lte: fin },
      },
      select: {
        monto: true,
        descripcion: true,
      },
    })

    let total = 0
    let totalEfectivo = 0
    let totalTransferencia = 0

    for (const g of gastos) {
      const montoNum = Number(g.monto || 0)
      total += montoNum
      const { origenFondos } = this.parsearDescripcionGasto(g.descripcion)
      if (origenFondos === 'TRANSFERENCIA') {
        totalTransferencia += montoNum
      } else {
        totalEfectivo += montoNum
      }
    }

    return { total, totalEfectivo, totalTransferencia }
  }

  // LISTADO DETALLADO PARA EL MODAL
  static async getGastosListado(fechaInicio: string, fechaFin: string) {
    try {
      const { inicio, fin } = this.getRangoUTC5(fechaInicio, fechaFin)

      const gastos = await prisma.gasto.findMany({
        where: {
          fechaRegistro: { gte: inicio, lte: fin },
        },
        orderBy: {
          fechaRegistro: 'desc',
        },
      })

      return gastos.map((g) => {
        const { origenFondos, descripcionLimpia } = this.parsearDescripcionGasto(g.descripcion)
        return {
          ...g,
          descripcion: descripcionLimpia,
          origenFondos,
        }
      })
    } catch (error) {
      console.error('Error al listar gastos:', error)
      return []
    }
  }

  // ELIMINAR UN GASTO
  static async eliminarGasto(id: number) {
    try {
      await prisma.gasto.delete({ where: { id: Number(id) } })
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar gasto:', error)
      return { success: false, error: 'No se pudo eliminar el gasto' }
    }
  }
}
