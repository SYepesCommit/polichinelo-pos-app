import { prisma } from '../../config/database'
import { dialog, app } from 'electron'
import path from 'path'
import fs from 'fs'

export const catalogoAuxService = {
  async getMetodosPago() {
    try {
      return await prisma.metodoPago.findMany({
        where: { activo: true },
        orderBy: { orden: 'asc' },
      })
    } catch (error) {
      console.error('Error al consultar métodos de pago en Prisma:', error)
      return []
    }
  },

  async getBancos() {
    try {
      return await prisma.banco.findMany({
        where: { activo: true },
      })
    } catch (error) {
      console.error('Error al consultar bancos en Prisma:', error)
      return []
    }
  },

  async crearBanco(nombre: string) {
    try {
      const nombreLimpio = nombre.trim()
      const id =
        nombreLimpio
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') || `banco-${Date.now()}`

      return await prisma.banco.upsert({
        where: { id },
        update: {
          nombre: nombreLimpio,
          activo: true,
        },
        create: {
          id,
          nombre: nombreLimpio,
          activo: true,
        },
      })
    } catch (error) {
      console.error('Error al crear banco:', error)
      throw error
    }
  },

  async eliminarBanco(id: string) {
    try {
      const pagosAsociados = await prisma.pagoDetalle.count({
        where: { bancoId: id },
      })

      if (pagosAsociados > 0) {
        return await prisma.banco.update({
          where: { id },
          data: { activo: false },
        })
      }

      return await prisma.banco.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Error al eliminar banco:', error)
      throw error
    }
  },

  async getCategorias() {
    try {
      return await prisma.categoria.findMany({
        orderBy: {
          id: 'asc',
        },
        include: {
          _count: {
            select: { productos: true },
          },
        },
      })
    } catch (error) {
      console.error('Error al obtener categorías:', error)
      throw error
    }
  },

  async createCategoria(nombre: string) {
    try {
      return await prisma.categoria.create({
        data: { nombre: nombre.trim() },
      })
    } catch (error) {
      console.error('Error al crear categoría:', error)
      throw error
    }
  },

  async updateCategoria(data: { id: number; nombre: string }) {
    try {
      return await prisma.categoria.update({
        where: { id: Number(data.id) },
        data: { nombre: data.nombre.trim() },
      })
    } catch (error) {
      console.error('Error al actualizar categoría:', error)
      throw error
    }
  },

  async deleteCategoria(id: number) {
    try {
      const idNum = Number(id)
      await prisma.producto.updateMany({
        where: { categoriaId: idNum },
        data: { categoriaId: null },
      })

      return await prisma.categoria.delete({
        where: { id: idNum },
      })
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      throw error
    }
  },

  async getIngredientes() {
    try {
      return await prisma.ingrediente.findMany({
        orderBy: {
          nombre: 'asc',
        },
        select: {
          id: true,
          nombre: true,
        },
      })
    } catch (error) {
      console.error('Error al obtener ingredientes:', error)
      return []
    }
  },

  async seleccionarYGuardarImagen(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Seleccionar imagen del producto',
      properties: ['openFile'],
      filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const rutaOrigen = result.filePaths[0]
    const extension = path.extname(rutaOrigen)
    const nombreArchivo = `prod_${Date.now()}${extension}`

    const carpetaUploads = path.join(app.getPath('userData'), 'uploads', 'productos')
    if (!fs.existsSync(carpetaUploads)) {
      fs.mkdirSync(carpetaUploads, { recursive: true })
    }

    const rutaDestino = path.join(carpetaUploads, nombreArchivo)
    fs.copyFileSync(rutaOrigen, rutaDestino)

    const buffer = fs.readFileSync(rutaDestino)
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg'

    return `data:${mimeType};base64,${buffer.toString('base64')}`
  },
}
