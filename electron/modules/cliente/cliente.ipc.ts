import { ipcMain } from 'electron'
import { clienteService } from './cliente.service'

export function registerClienteIpc() {
  // Buscar cliente por número de teléfono
  ipcMain.handle('get-cliente-by-telefono', async (_, telefono: string) => {
    try {
      return await clienteService.buscarPorTelefono(telefono)
    } catch (error) {
      console.error('Error al buscar cliente por teléfono:', error)
      return null
    }
  })

  // Guardar o actualizar cliente (Upsert)
  ipcMain.handle(
    'upsert-cliente',
    async (
      _,
      data: {
        nombre: string
        telefono: string
        direccion: string
        referenciaDireccion?: string
      }
    ) => {
      try {
        return await clienteService.guardarOActualizarCliente(data)
      } catch (error) {
        console.error('Error al guardar o actualizar cliente:', error)
        return null
      }
    }
  )
}