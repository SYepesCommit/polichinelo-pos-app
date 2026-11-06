import { prisma } from '../../config/database'
import { catalogoAuxService } from './catalogoAux.service'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { fileURLToPath } from 'node:url'

function extractIngredientNames(ingredientes: any): string[] {
  if (!ingredientes) return []
  if (typeof ingredientes === 'string') {
    return Array.from(
      new Set(
        ingredientes
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i.length > 0)
      )
    )
  }
  if (Array.isArray(ingredientes)) {
    const names: string[] = []
    for (const item of ingredientes) {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed) names.push(trimmed)
      } else if (item && typeof item === 'object') {
        const rawName = item.ingrediente?.nombre || item.nombre
        if (typeof rawName === 'string') {
          const trimmed = rawName.trim()
          if (trimmed) names.push(trimmed)
        }
      }
    }
    return Array.from(new Set(names))
  }
  return []
}

export const productoService = {
  ...catalogoAuxService,

  async getCategoriasConProductos() {
    try {
      const categorias = await prisma.categoria.findMany({
        orderBy: { id: 'asc' },
        include: {
          productos: {
            where: { activo: true },
            orderBy: [{ precioVenta: 'asc' }, { nombre: 'asc' }],
            include: {
              ingredientes: {
                include: {
                  ingrediente: true,
                },
              },
            },
          },
        },
      })

      return categorias.map((cat) => ({
        ...cat,
        id: String(cat.id),
        productos: cat.productos.map((prod) => {
          const nombresIngredientes = prod.ingredientes.map(
            (pi) => pi.ingrediente.nombre
          )

          return {
            ...prod,
            id: String(prod.id),
            precio: Number(prod.precioVenta),
            descripcion: nombresIngredientes.join(', ') || null,
            ingredientes: nombresIngredientes,
          }
        }),
      }))
    } catch (error) {
      console.error('Error al consultar categorías en Prisma:', error)
      return []
    }
  },

  async toggleEspecial(productoId: string | number, esEspecial: boolean) {
    try {
      return await prisma.producto.update({
        where: { id: Number(productoId) },
        data: { esEspecial },
      })
    } catch (error) {
      console.error('Error al cambiar estado especial del producto:', error)
      throw error
    }
  },

  async crearProductoEspecial(data: {
    nombre: string
    precio: number
    categoriaId: string | number
    ingredientes?: string[]
  }) {
    try {
      const ingredientesArray = data.ingredientes || []

      return await prisma.producto.create({
        data: {
          nombre: data.nombre,
          precioVenta: data.precio,
          categoria: {
            connect: {
              id: Number(data.categoriaId),
            },
          },
          esEspecial: true,
          activo: true,
          ingredientes: {
            create: ingredientesArray.map((nombreIng) => ({
              ingrediente: {
                connectOrCreate: {
                  where: { nombre: nombreIng.trim() },
                  create: { nombre: nombreIng.trim() },
                },
              },
            })),
          },
        },
        include: {
          categoria: true,
          ingredientes: {
            include: {
              ingrediente: true,
            },
          },
        },
      })
    } catch (error) {
      console.error('Error al crear producto especial:', error)
      throw error
    }
  },

  async desactivarProductoEspecial(productoId: string | number) {
    try {
      return await prisma.producto.update({
        where: { id: Number(productoId) },
        data: {
          activo: false,
          esEspecial: false,
        },
      })
    } catch (error) {
      console.error('Error al desactivar plato especial:', error)
      throw error
    }
  },

  async getEspecialesDesactivados() {
    try {
      return await prisma.producto.findMany({
        where: {
          esEspecial: true,
          activo: false,
        },
        include: {
          categoria: true,
          ingredientes: {
            include: {
              ingrediente: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      })
    } catch (error) {
      console.error('Error al obtener especiales desactivados:', error)
      return []
    }
  },

  async eliminarProductoDefinitivo(productoId: string | number) {
    try {
      const idNum = Number(productoId)

      const ventasAsociadas = await prisma.pedidoDetalle.count({
        where: { productoId: idNum },
      })

      if (ventasAsociadas > 0) {
        throw new Error(
          `No se puede eliminar definitivamente porque el plato tiene ${ventasAsociadas} venta(s) registrada(s) en historial.`
        )
      }

      return await prisma.producto.delete({
        where: { id: idNum },
      })
    } catch (error) {
      console.error('Error al eliminar definitivamente producto:', error)
      throw error
    }
  },

  limpiarArchivoImagenLocal(imagenUrl: string | null | undefined) {
    if (!imagenUrl) return
    try {
      const uploadsDir = path.join(app.getPath('userData'), 'uploads')
      let rutaABorrar: string | null = null

      if (imagenUrl.startsWith('pos-media://')) {
        rutaABorrar = path.join(uploadsDir, imagenUrl.replace('pos-media://', ''))
      } else if (imagenUrl.startsWith('file://')) {
        try {
          rutaABorrar = fileURLToPath(imagenUrl)
        } catch {
          rutaABorrar = imagenUrl.replace('file://', '')
        }
      } else if (!imagenUrl.startsWith('data:') && !imagenUrl.startsWith('http')) {
        rutaABorrar = path.isAbsolute(imagenUrl)
          ? imagenUrl
          : path.join(uploadsDir, imagenUrl)
      }

      if (rutaABorrar && fs.existsSync(rutaABorrar)) {
        fs.unlinkSync(rutaABorrar)
        console.log('🗑️ Imagen local antigua eliminada:', rutaABorrar)
      }
    } catch (err) {
      console.warn('No se pudo borrar la imagen local:', err)
    }
  },

  async purgarImagenesHuerfanas() {
    try {
      const uploadsDir = path.join(app.getPath('userData'), 'uploads')
      const carpetas = [
        path.join(uploadsDir, 'productos'),
        path.join(uploadsDir, 'products'),
      ]

      const productos = await prisma.producto.findMany({
        where: { imagenUrl: { not: null } },
        select: { imagenUrl: true },
      })

      const urlsActivas = new Set(productos.map((p) => p.imagenUrl as string))

      for (const carpeta of carpetas) {
        if (!fs.existsSync(carpeta)) continue
        const archivos = fs.readdirSync(carpeta)
        for (const archivo of archivos) {
          const rutaArchivo = path.join(carpeta, archivo)
          const rutaNormalizada = rutaArchivo.replace(/\\/g, '/')
          const estaEnUso = Array.from(urlsActivas).some(
            (url) => url.includes(archivo) || url.includes(rutaNormalizada)
          )
          if (!estaEnUso) {
            try {
              fs.unlinkSync(rutaArchivo)
              console.log('🧹 Imagen huérfana eliminada:', rutaArchivo)
            } catch {
              // Ignorar
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error purgando imágenes huérfanas:', err)
    }
  },

  async getProductos() {
    try {
      return await prisma.producto.findMany({
        include: {
          categoria: true,
          ingredientes: {
            include: {
              ingrediente: true,
            },
          },
        },
        orderBy: [
          { categoriaId: 'asc' },
          { nombre: 'asc' },
        ],
      })
    } catch (error) {
      console.error('Error al obtener productos:', error)
      throw error
    }
  },

  async createProducto(dto: any) {
    try {
      const ingredientesArray = extractIngredientNames(dto.ingredientes)

      return await prisma.producto.create({
        data: {
          nombre: dto.nombre,
          precioVenta: Number(dto.precioVenta),
          costoBase: dto.costoBase ? Number(dto.costoBase) : 0,
          categoriaId: dto.categoriaId ? Number(dto.categoriaId) : null,
          activo: dto.activo ?? true,
          esEspecial: dto.esEspecial ?? false,
          imagenUrl: dto.imagenUrl || null,
          ...(ingredientesArray.length > 0
            ? {
                ingredientes: {
                  create: ingredientesArray.map((nombreIng) => ({
                    ingrediente: {
                      connectOrCreate: {
                        where: { nombre: nombreIng },
                        create: { nombre: nombreIng },
                      },
                    },
                  })),
                },
              }
            : {}),
        },
        include: {
          categoria: true,
          ingredientes: {
            include: {
              ingrediente: true,
            },
          },
        },
      })
    } catch (error) {
      console.error('Error al crear producto:', error)
      throw error
    }
  },

  async updateProducto(dto: any) {
    try {
      const productoId = Number(dto.id)

      return await prisma.$transaction(async (tx) => {
        const productoActual = await tx.producto.findUnique({
          where: { id: productoId },
          select: { imagenUrl: true },
        })

        if (
          dto.imagenUrl !== undefined &&
          productoActual?.imagenUrl &&
          productoActual.imagenUrl !== dto.imagenUrl
        ) {
          this.limpiarArchivoImagenLocal(productoActual.imagenUrl)
        }

        const dataToUpdate: any = {
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.precioVenta !== undefined ? { precioVenta: Number(dto.precioVenta) } : {}),
          ...(dto.costoBase !== undefined ? { costoBase: Number(dto.costoBase) } : {}),
          ...(dto.categoriaId !== undefined
            ? { categoriaId: dto.categoriaId ? Number(dto.categoriaId) : null }
            : {}),
          ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
          ...(dto.esEspecial !== undefined ? { esEspecial: dto.esEspecial } : {}),
          ...(dto.imagenUrl !== undefined ? { imagenUrl: dto.imagenUrl || null } : {}),
        }

        if (dto.ingredientes !== undefined) {
          await tx.productoIngrediente.deleteMany({
            where: { productoId },
          })

          const ingredientesArray = extractIngredientNames(dto.ingredientes)
          if (ingredientesArray.length > 0) {
            dataToUpdate.ingredientes = {
              create: ingredientesArray.map((nombreIng) => ({
                ingrediente: {
                  connectOrCreate: {
                    where: { nombre: nombreIng },
                    create: { nombre: nombreIng },
                  },
                },
              })),
            }
          }
        }

        return await tx.producto.update({
          where: { id: productoId },
          data: dataToUpdate,
          include: {
            categoria: true,
            ingredientes: {
              include: {
                ingrediente: true,
              },
            },
          },
        })
      })
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      throw error
    }
  },

  async deleteProducto(id: number) {
    try {
      const idNum = Number(id)
      const producto = await prisma.producto.findUnique({
        where: { id: idNum },
        include: {
          _count: {
            select: { pedidoDetalles: true },
          },
        },
      })

      if (!producto) {
        throw new Error('El producto no existe.')
      }

      // Si el producto ya tiene ventas históricas asociadas (> 0 pedidos en historial)
      if (producto._count.pedidoDetalles > 0) {
        const desactivado = await prisma.producto.update({
          where: { id: idNum },
          data: { activo: false },
          include: {
            categoria: true,
            ingredientes: {
              include: {
                ingrediente: true,
              },
            },
          },
        })
        return {
          ...desactivado,
          desactivadoLogico: true,
          mensaje:
            'El producto tiene pedidos históricos registrados. Se retiró del menú para proteger el historial contable.',
        }
      }

      // Si no tiene ventas (0 pedidos asociados), se borra definitivamente
      await prisma.productoIngrediente.deleteMany({
        where: { productoId: idNum },
      })

      if (producto.imagenUrl) {
        this.limpiarArchivoImagenLocal(producto.imagenUrl)
      }

      const eliminado = await prisma.producto.delete({
        where: { id: idNum },
      })

      return {
        ...eliminado,
        desactivadoLogico: false,
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      throw error
    }
  },
}
