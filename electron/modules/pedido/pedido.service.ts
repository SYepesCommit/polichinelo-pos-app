import { prisma } from '../../config/database'
import { backupService } from '../backup/backup.service'

export const pedidoService = {
  async crearPedido(data: {
    tipoPedido: string
    montoDomicilio?: number
    detallesDestino?: string
    observacionesGenerales?: string
    clienteData?: {
      telefono?: string
      nombre?: string
      direccion?: string
      referenciaDireccion?: string
    }
    detalles: Array<{
      productoId: string | number
      cantidad: number
      precioUnitario: number
      observaciones?: string
    }>
    pagos: Array<{
      metodoPagoId?: string | number
      metodoPago: string
      bancoId?: string | number
      monto: number
    }>
    total: number
  }) {
    try {
      const pedidoCreado = await prisma.$transaction(async (tx) => {
        let clienteId: number | null = null

        if (data.clienteData?.telefono && data.clienteData?.nombre) {
          const clienteExistente = await tx.cliente.upsert({
            where: { telefono: data.clienteData.telefono.trim() },
            update: {
              nombre: data.clienteData.nombre.trim(),
              direccion: data.clienteData.direccion?.trim() || 'Sin dirección',
              referenciaDireccion: data.clienteData.referenciaDireccion?.trim() || null,
            },
            create: {
              telefono: data.clienteData.telefono.trim(),
              nombre: data.clienteData.nombre.trim(),
              direccion: data.clienteData.direccion?.trim() || 'Sin dirección',
              referenciaDireccion: data.clienteData.referenciaDireccion?.trim() || null,
            },
          })
          clienteId = clienteExistente.id
        }

        const detallesData = data.detalles.map((d) => {
          const isNum = !isNaN(Number(d.productoId)) && d.productoId !== 'item-libre'
          const productoIdFinal = isNum ? Number(d.productoId) : null
          const subtotalItem = Number(d.cantidad) * Number(d.precioUnitario)
          return {
            productoId: productoIdFinal,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            observaciones: d.observaciones || null,
            subtotal: subtotalItem,
          }
        })

        const pagosData = data.pagos.map((p) => {
          const pagoObj: any = {
            metodoPago: p.metodoPago,
            monto: Number(p.monto),
          }
          if (p.bancoId && String(p.bancoId).trim() !== '') {
            pagoObj.banco = {
              connect: { id: String(p.bancoId) },
            }
          }
          return pagoObj
        })

        const detallesDestinoSnapshot =
          data.tipoPedido === 'DOMICILIO' && data.clienteData
            ? JSON.stringify({
                nombre: data.clienteData.nombre?.trim() || data.detallesDestino || 'Cliente',
                telefono: data.clienteData.telefono?.trim() || '',
                direccion: data.clienteData.direccion?.trim() || '',
                referenciaDireccion: data.clienteData.referenciaDireccion?.trim() || '',
              })
            : data.detallesDestino || null

        return await tx.pedido.create({
          data: {
            clienteId,
            tipoPedido: data.tipoPedido,
            detallesDestino: detallesDestinoSnapshot,
            observacionesGenerales: data.observacionesGenerales?.trim() || null,
            montoDomicilio: Number(data.montoDomicilio || 0),
            estado: 'REALIZADO',
            total: Number(data.total),
            detalles: {
              create: detallesData,
            },
            pagos: {
              create: pagosData,
            },
          },
          include: {
            detalles: {
              include: {
                producto: true,
              },
            },
            cliente: true,
            pagos: {
              include: {
                banco: true,
              },
            },
          },
        })
      })

      // Actualizar copia del día en segundo plano si hoy es de jueves a domingo
      backupService.ejecutarBackup('AUTOMATICO').catch(() => {})

      return pedidoCreado
    } catch (error) {
      console.error('Error al registrar pedido (transacción abortada):', error)
      throw error
    }
  },
}
