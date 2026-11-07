import { prisma } from '../../config/database'

const PREFIJO_TRANSF = '[TRANSFERENCIA] '

export class GastosService {
  private static getRangoUTC5(fechaInicioStr: string, fechaFinStr?: string) {
    const finStr = fechaFinStr || fechaInicioStr
    const inicio = new Date(`${fechaInicioStr}T00:00:00-05:00`)
    const fin = new Date(`${finStr}T23:59:59.999-05:00`)
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
      const hoyColombia = ahora.toLocaleDateString('en-CA', {
        timeZone: 'America/Bogota',
      })

      let fechaParaGuardar: Date
      if (!fecha || fecha === hoyColombia) {
        // Si es del día de hoy, guardar el instante exacto real
        fechaParaGuardar = ahora
      } else {
        // Si se registra para otra fecha seleccionada en el filtro, conservar la hora actual de Colombia en esa fecha
        const horaColombia = ahora.toLocaleTimeString('en-GB', {
          timeZone: 'America/Bogota',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        fechaParaGuardar = new Date(`${fecha}T${horaColombia}-05:00`)
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
