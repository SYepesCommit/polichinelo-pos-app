import { ipcMain } from 'electron'
import { ventaService } from './venta.service'

export function registerVentaIpc() {
  ipcMain.removeHandler('getVentasPorFecha')
  ipcMain.handle('getVentasPorFecha', async (_, fecha: string) => {
    return await ventaService.getVentasPorFecha(fecha)
  })

  ipcMain.removeHandler('getVentasPorRango')
  ipcMain.handle('getVentasPorRango', async (_, fechaInicio: string, fechaFin: string) => {
    return await ventaService.getVentasPorRango(fechaInicio, fechaFin)
  })

  ipcMain.removeHandler('anularVenta')
  ipcMain.handle('anularVenta', async (_, ventaId: number, motivo?: string) => {
    return await ventaService.anularVenta(ventaId, motivo)
  })

  ipcMain.removeHandler('revertirAnulacionVenta')
  ipcMain.handle('revertirAnulacionVenta', async (_, ventaId: number) => {
    return await ventaService.revertirAnulacionVenta(ventaId)
  })

  ipcMain.removeHandler('desanular-venta')
  ipcMain.handle('desanular-venta', async (_, id: number) => {
    return await ventaService.desanularVenta(id)
  })

  ipcMain.removeHandler('get-ventas-paginadas')
  ipcMain.handle('get-ventas-paginadas', async (_, filtros) => {
    return await ventaService.getVentasPaginadas(filtros)
  })

  ipcMain.removeHandler('cambiar-metodo-pago-venta')
  ipcMain.handle(
    'cambiar-metodo-pago-venta',
    async (_, data: { pedidoId: number; metodoPago: string; bancoId?: string | null }) => {
      return await ventaService.cambiarMetodoPagoVenta(data)
    }
  )

  ipcMain.removeHandler('exportar-reporte-csv')
  ipcMain.handle('exportar-reporte-csv', async (_, filtros) => {
    return await ventaService.exportarReporteCsv(filtros)
  })
}
