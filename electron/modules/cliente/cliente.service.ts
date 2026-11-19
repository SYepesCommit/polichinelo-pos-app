import { prisma } from '../../config/database'

export const clienteService = {
  async crearOActualizar(clienteData: any) {
    return await prisma.cliente.upsert({
      where: { telefono: clienteData.telefono },
      update: {
        nombre: clienteData.nombre,
        direccion: clienteData.direccion,
        referenciaDireccion: clienteData.referenciaDireccion,
      },
      create: clienteData,
    })
  },

  // Buscar cliente por número de teléfono (incluyendo su último pedido activo para "Repetir pedido")
  async buscarPorTelefono(telefono: string) {
    try {
      const telLimpio = telefono.trim()
      if (!telLimpio) return null

      const cliente = await prisma.cliente.findUnique({
        where: { telefono: telLimpio },
        include: {
          pedidos: {
            where: {
              estado: { not: 'ANULADO' },
            },
            orderBy: { id: 'desc' },
            take: 1,
            include: {
              detalles: {
                include: {
                  producto: true,
                },
              },
            },
          },
        },
      })

      if (!cliente) return null

      const ultimo = cliente.pedidos?.[0] || null
      let ultimoPedido = null

      if (ultimo && Array.isArray(ultimo.detalles) && ultimo.detalles.length > 0) {
        ultimoPedido = {
          id: ultimo.id,
          fechaRegistro: ultimo.fechaRegistro,
          montoDomicilio: Number(ultimo.montoDomicilio || 0),
          total: Number(ultimo.total || 0),
          items: ultimo.detalles.map((d) => {
            let nombre = d.producto?.nombre || ''
            let obs = d.observaciones || ''

            if (!nombre && obs) {
              const match = obs.match(/^\[LIBRE:\s*([^\]]+)\]/i)
              if (match) {
                nombre = match[1].trim()
                obs = obs.replace(/^\[LIBRE:\s*[^\]]+\]\s*(\|\s*)?/i, '').trim()
              } else {
                nombre = obs
                obs = ''
              }
            }

            return {
              productoId: d.productoId ? String(d.productoId) : 'item-libre',
              nombre: nombre || 'Ítem Libre',
              cantidad: Number(d.cantidad || 1),
              precioUnitario: Number(d.precioUnitario || d.producto?.precioVenta || 0),
              precioBase: Number(d.producto?.precioVenta || d.precioUnitario || 0),
              observaciones: obs || '',
            }
          }),
        }
      }

      return {
        id: cliente.id,
        telefono: cliente.telefono,
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        referenciaDireccion: cliente.referenciaDireccion,
        ultimoPedido,
      }
    } catch (error) {
      console.error('Error al buscar cliente por teléfono:', error)
      return null
    }
  },

  // Guardar nuevo o actualizar cliente existente
  async guardarOActualizarCliente(data: {
    nombre: string
    telefono: string
    direccion: string
    referenciaDireccion?: string
  }) {
    try {
      const telLimpio = data.telefono.trim()
      if (!telLimpio) return null

      return await prisma.cliente.upsert({
        where: { telefono: telLimpio },
        update: {
          nombre: data.nombre.trim(),
          direccion: data.direccion.trim(),
          referenciaDireccion: data.referenciaDireccion?.trim() || null,
        },
        create: {
          telefono: telLimpio,
          nombre: data.nombre.trim(),
          direccion: data.direccion.trim(),
          referenciaDireccion: data.referenciaDireccion?.trim() || null,
        },
      })
    } catch (error) {
      console.error('Error al guardar/actualizar cliente:', error)
      return null
    }
  }
}