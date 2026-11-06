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

  // Buscar cliente por número de teléfono
  async buscarPorTelefono(telefono: string) {
    try {
      const telLimpio = telefono.trim()
      if (!telLimpio) return null

      return await prisma.cliente.findUnique({
        where: { telefono: telLimpio },
      })
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