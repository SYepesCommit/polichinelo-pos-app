import { ipcMain } from 'electron'
import { GastosService } from './gasto.service'

export const registerGastosIpc = () => {
ipcMain.handle('registrarGasto', async (_, datos) => {
  return await GastosService.registrarGasto(datos)
})

ipcMain.handle('getGastosRango', async (_, fechaInicio, fechaFin) => {
  return await GastosService.getGastosRango(fechaInicio, fechaFin)
})

ipcMain.handle('getGastosListado', async (_, fechaInicio, fechaFin) => {
  return await GastosService.getGastosListado(fechaInicio, fechaFin)
})

ipcMain.handle('eliminarGasto', async (_, id: number) => {
  return await GastosService.eliminarGasto(id)
})
}