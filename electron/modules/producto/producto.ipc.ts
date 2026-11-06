import { app, ipcMain, protocol, net } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import { productoService } from './producto.service'

// 🔴 SI printer.service.ts está en src/services/printer.service.ts:
import { imprimirComandaTermica } from '../../../src/services/printer.service'

// 🔴 SI printer.service.ts está en electron/services/printer.service.ts:
// import { imprimirComandaTermica } from '../../services/printer.service'

// Directorio persistente para almacenar las imágenes de la aplicación
const UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads')

export function registerProductoIpc() {
  console.log('🔌 Registrando manejadores de IPC para productos, métodos de pago, bancos e imágenes...')

  // Asegurar que exista la estructura de directorios de almacenamiento local
  fs.ensureDirSync(path.join(UPLOADS_DIR, 'products'))

  // 0. REGISTRO DE PROTOCOLO PERSONALIZADO PARA SERVIR IMÁGENES SEGURAS EN REACT
  protocol.handle('pos-media', (request) => {
    const relativePath = request.url.replace('pos-media://', '')
    const safePath = path.normalize(path.join(UPLOADS_DIR, relativePath))
    return net.fetch(`file://${safePath}`)
  })

  // 1. MANEJO DE ARCHIVOS MÓDULO IMÁGENES (Upload & Delete)
  ipcMain.handle('upload-product-image', async (_, { filePath, fileName }: { filePath: string; fileName: string }) => {
    try {
      const fileExtension = path.extname(fileName)
      const uniqueName = `products/prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${fileExtension}`
      const destPath = path.join(UPLOADS_DIR, uniqueName)

      await fs.copy(filePath, destPath)

      return { success: true, relativePath: uniqueName }
    } catch (error: any) {
      console.error('Error IPC upload-product-image:', error)
      return { success: false, error: error.message || 'No se pudo guardar la imagen localmente.' }
    }
  })

  ipcMain.handle('delete-product-image', async (_, relativePath: string) => {
    if (!relativePath) return { success: true }
    try {
      const fullPath = path.join(UPLOADS_DIR, relativePath)
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath)
      }
      return { success: true }
    } catch (error: any) {
      console.error('Error IPC delete-product-image:', error)
      return { success: false, error: error.message }
    }
  })

  // 2. OBTENER CATEGORÍAS Y PRODUCTOS
  ipcMain.handle('get-categorias-productos', async () => {
    console.log('📥 Consultando menú (categorías y productos)...')
    try {
      const categorias = await productoService.getCategoriasConProductos()
      console.log(`📤 Enviando ${categorias.length} categorías al Front`)
      return categorias
    } catch (error) {
      console.error('Error al obtener productos/categorías:', error)
      return []
    }
  })

  // 3. TOGGLE DE PLATO DEL DÍA / ESPECIAL
  ipcMain.handle('toggle-especial-producto', async (_, productoId: string, esEspecial: boolean) => {
    console.log(`📥 Cambiando estado especial de producto ${productoId} a: ${esEspecial}`)
    try {
      const actualizado = await productoService.toggleEspecial(productoId, esEspecial)
      return actualizado
    } catch (error) {
      console.error('Error IPC toggle-especial-producto:', error)
      return null
    }
  })

  // 4. OBTENER MÉTODOS DE PAGO DINÁMICOS
  ipcMain.handle('get-metodos-pago', async () => {
    console.log('📥 Consultando métodos de pago activos...')
    try {
      const metodos = await productoService.getMetodosPago()
      console.log(`📤 Enviando ${metodos.length} métodos de pago al Front`)
      return metodos
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error)
      return []
    }
  })

  // 5. OBTENER Y GESTIONAR BANCOS
  ipcMain.handle('get-bancos', async () => {
    console.log('📥 Consultando entidades bancarias activas...')
    try {
      const bancos = await productoService.getBancos()
      console.log(`📤 Enviando ${bancos.length} bancos al Front`)
      return bancos
    } catch (error) {
      console.error('Error al obtener bancos:', error)
      return []
    }
  })

  ipcMain.handle('crear-banco', async (_, nombre: string) => {
    try {
      return await productoService.crearBanco(nombre)
    } catch (error) {
      console.error('Error IPC crear-banco:', error)
      return null
    }
  })

  ipcMain.handle('eliminar-banco', async (_, id: string) => {
    try {
      return await productoService.eliminarBanco(id)
    } catch (error) {
      console.error('Error IPC eliminar-banco:', error)
      return null
    }
  })

  // 6. GESTIÓN DE PRODUCTOS Y ESPECIALES
  ipcMain.handle('crear-producto-especial', async (_, data) => {
    console.log('📥 Creando nuevo producto especial express:', data)
    try {
      const nuevoProducto = await productoService.crearProductoEspecial(data)
      return nuevoProducto
    } catch (error) {
      console.error('Error IPC crear-producto-especial:', error)
      return null
    }
  })

  ipcMain.handle('desactivar-producto-especial', async (_, productoId: number) => {
    try {
      return await productoService.desactivarProductoEspecial(productoId)
    } catch (error) {
      console.error('Error IPC desactivar-producto-especial:', error)
      return null
    }
  })

  ipcMain.handle('get-especiales-desactivados', async () => {
    try {
      return await productoService.getEspecialesDesactivados()
    } catch (error) {
      console.error('Error IPC get-especiales-desactivados:', error)
      return []
    }
  })

  ipcMain.handle('eliminar-producto-definitivo', async (_, productoId: number) => {
    try {
      const productoEliminado = await productoService.eliminarProductoDefinitivo(productoId)

      if (productoEliminado?.imagenUrl) {
        const fullPath = path.join(UPLOADS_DIR, productoEliminado.imagenUrl)
        if (await fs.pathExists(fullPath)) {
          await fs.remove(fullPath)
        }
      }

      return { success: true, producto: productoEliminado }
    } catch (error: any) {
      console.error('Error IPC eliminar-producto-definitivo:', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('imprimir-comanda', async (_, datosComanda) => {
    return await imprimirComandaTermica(datosComanda)
  })

  ipcMain.removeHandler('get-productos')
  ipcMain.handle('get-productos', async () => {
    return await productoService.getProductos()
  })

  ipcMain.removeHandler('get-categorias')
  ipcMain.handle('get-categorias', async () => {
    return await productoService.getCategorias()
  })

  ipcMain.removeHandler('create-categoria')
  ipcMain.handle('create-categoria', async (_, nombre: string) => {
    return await productoService.createCategoria(nombre)
  })

  ipcMain.removeHandler('update-categoria')
  ipcMain.handle('update-categoria', async (_, data: { id: number; nombre: string }) => {
    return await productoService.updateCategoria(data)
  })

  ipcMain.removeHandler('delete-categoria')
  ipcMain.handle('delete-categoria', async (_, id: number) => {
    return await productoService.deleteCategoria(id)
  })

  ipcMain.removeHandler('get-ingredientes')
  ipcMain.handle('get-ingredientes', async () => {
    return await productoService.getIngredientes()
  })

  ipcMain.removeHandler('create-producto')
  ipcMain.handle('create-producto', async (_, dto) => {
    return await productoService.createProducto(dto)
  })

  ipcMain.removeHandler('update-producto')
  ipcMain.handle('update-producto', async (_, dto) => {
    return await productoService.updateProducto(dto)
  })

  ipcMain.removeHandler('delete-producto')
  ipcMain.handle('delete-producto', async (_, id: number) => {
    return await productoService.deleteProducto(id)
  })

  ipcMain.removeHandler('seleccionar-imagen-producto')
  ipcMain.handle('seleccionar-imagen-producto', async () => {
    return await productoService.seleccionarYGuardarImagen()
  })
}
