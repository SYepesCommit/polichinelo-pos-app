import { prisma } from '../../config/database'

export class GastosService {
  private static getRangoUTC5(fechaInicioStr: string, fechaFinStr?: string) {
    const finStr = fechaFinStr || fechaInicioStr
    const inicio = new Date(`${fechaInicioStr}T00:00:00-05:00`)
    const fin = new Date(`${finStr}T23:59:59.999-05:00`)
    return { inicio, fin }
  }

  // Registrar gasto
  static async registrarGasto(datos: { concepto: string; monto: number; fecha: string }) {
    try {
      const { concepto, monto, fecha } = datos
      // Guardar a las 12:00 del mediodía en hora Colombia UTC-5 para que caiga con certeza dentro del día calendario
      const fechaParaGuardar = new Date(`${fecha}T12:00:00-05:00`)

      const nuevoGasto = await prisma.gasto.create({
        data: {
          descripcion: concepto.trim(),
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

  // Suma total para las tarjetas de métricas
  static async getGastosRango(fechaInicio: string, fechaFin: string) {
    const { inicio, fin } = this.getRangoUTC5(fechaInicio, fechaFin)

    const resultado = await prisma.gasto.aggregate({
      _sum: { monto: true },
      where: {
        fechaRegistro: { gte: inicio, lte: fin },
      },
    })
    return { total: resultado._sum.monto || 0 }
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

      return gastos
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
