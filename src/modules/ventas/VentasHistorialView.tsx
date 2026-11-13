import React from 'react'
import { useVentasHistorial } from '@/hooks/ventas/useVentasHistorial'
import { TicketPreviewModal } from '../pos/TicketPreviewModal'
import { VentasFilters } from './VentasFilters'
import { VentasHeader } from './VentasHeader'
import { VentasList } from './VentasList'
import { VentasMetrics } from './VentasMetrics'
import { VentasModals } from './VentasModals'
import { VentasPagination } from './VentasPagination'
import { RankingProductosModal } from './RankingProductosModal'
import { DesgloseBancosModal } from './DesgloseBancosModal'
import { CambiarMetodoPagoModal } from './CambiarMetodoPagoModal'
import { LiquidacionDomiciliosModal } from './LiquidacionDomiciliosModal'

export const VentasHistorialView: React.FC = () => {
  const hook = useVentasHistorial()

  const formatMoneda = (monto: number) => monto.toLocaleString('es-CO')
  const efectivoEsperado =
    (hook.metricas?.totalEfectivo || 0) - (hook.totalGastosEfectivo ?? hook.totalGastos ?? 0)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col select-none">
      <VentasHeader
        modoFecha={hook.modoFecha}
        setModoFecha={hook.setModoFecha}
        fechaUnica={hook.fechaUnica}
        setFechaUnica={hook.setFechaUnica}
        fechaInicio={hook.fechaInicio}
        setFechaInicio={hook.setFechaInicio}
        fechaFin={hook.fechaFin}
        setFechaFin={hook.setFechaFin}
        cargando={hook.cargando}
        exportandoCsv={hook.exportandoCsv}
        handleIrAHoy={hook.handleIrAHoy}
        handleIrAAyer={hook.handleIrAAyer}
        handleIrAEstaSemana={hook.handleIrAEstaSemana}
        handleIrAEsteMes={hook.handleIrAEsteMes}
        recargarVentas={hook.recargarVentas}
        setModalGastoAbierto={hook.setModalGastoAbierto}
        handleExportarCsv={hook.handleExportarCsv}
      />

      <VentasMetrics
        metricas={hook.metricas}
        totalGastos={hook.totalGastos}
        totalGastosEfectivo={hook.totalGastosEfectivo}
        totalGastosTransferencia={hook.totalGastosTransferencia}
        efectivoEsperado={efectivoEsperado}
        formatMoneda={formatMoneda}
        handleAbrirDetalleGastos={hook.handleAbrirDetalleGastos}
        handleAbrirRankingProductos={() => hook.setModalRankingAbierto(true)}
        handleAbrirDesgloseBancos={() => hook.setModalBancosAbierto(true)}
        handleAbrirLiquidacionDomicilios={hook.handleAbrirLiquidacionDomicilios}
      />

      <VentasFilters
        busqueda={hook.busqueda}
        setBusqueda={hook.setBusqueda}
        filtroEstadoVenta={hook.filtroEstadoVenta}
        setFiltroEstadoVenta={hook.setFiltroEstadoVenta}
        tipoPedidoFiltro={hook.tipoPedidoFiltro}
        setTipoPedidoFiltro={hook.setTipoPedidoFiltro}
        bancoFiltro={hook.bancoFiltro}
        nombreBancoFiltro={hook.nombreBancoFiltro}
        onLimpiarBancoFiltro={() => hook.setBancoFiltro('TODOS')}
      />

      <VentasList
        cargando={hook.cargando}
        ventasFiltradas={hook.ventasFiltradas}
        modoFecha={hook.modoFecha}
        ventaExpandidaId={hook.ventaExpandidaId}
        toggleExpandir={hook.toggleExpandir}
        handleReimprimir={hook.handleReimprimir}
        setVentaADesanular={hook.setVentaADesanular}
        handleAbrirAnulacion={hook.handleAbrirAnulacion}
        handleAbrirCambiarPago={(v) => hook.setVentaACambiarPago(v)}
        formatMoneda={formatMoneda}
      />

      <VentasPagination
        cantidadMostrando={hook.ventasFiltradas.length}
        totalRegistros={hook.totalRegistros}
        paginaActual={hook.paginaActual}
        totalPaginas={hook.totalPaginas}
        cargando={hook.cargando}
        setPaginaActual={hook.setPaginaActual}
      />

      <VentasModals
        modalGastoAbierto={hook.modalGastoAbierto}
        setModalGastoAbierto={hook.setModalGastoAbierto}
        conceptoGasto={hook.conceptoGasto}
        setConceptoGasto={hook.setConceptoGasto}
        montoGasto={hook.montoGasto}
        setMontoGasto={hook.setMontoGasto}
        origenFondosGasto={hook.origenFondosGasto}
        setOrigenFondosGasto={hook.setOrigenFondosGasto}
        handleGuardarGasto={hook.handleGuardarGasto}
        guardandoGasto={hook.guardandoGasto}
        modalDetalleGastosAbierto={hook.modalDetalleGastosAbierto}
        setModalDetalleGastosAbierto={hook.setModalDetalleGastosAbierto}
        listaGastos={hook.listaGastos}
        cargandoGastos={hook.cargandoGastos}
        handleEliminarGasto={hook.handleEliminarGasto}
        totalGastos={hook.totalGastos}
        totalGastosEfectivo={hook.totalGastosEfectivo}
        totalGastosTransferencia={hook.totalGastosTransferencia}
        ventaAAnular={hook.ventaAAnular}
        setVentaAAnular={hook.setVentaAAnular}
        motivoAnulacion={hook.motivoAnulacion}
        setMotivoAnulacion={hook.setMotivoAnulacion}
        otroMotivo={hook.otroMotivo}
        setOtroMotivo={hook.setOtroMotivo}
        handleConfirmarAnulacion={hook.handleConfirmarAnulacion}
        ventaADesanular={hook.ventaADesanular}
        setVentaADesanular={hook.setVentaADesanular}
        handleConfirmarDesanulacion={hook.handleConfirmarDesanulacion}
        formatMoneda={formatMoneda}
      />

      <RankingProductosModal
        abierto={hook.modalRankingAbierto}
        onCerrar={() => hook.setModalRankingAbierto(false)}
        rankingProductos={hook.metricas?.rankingProductos || []}
        totalUnidadesVendidas={hook.metricas?.totalUnidadesVendidas || 0}
        formatMoneda={formatMoneda}
      />

      <DesgloseBancosModal
        abierto={hook.modalBancosAbierto}
        onCerrar={() => hook.setModalBancosAbierto(false)}
        desgloseBancos={hook.metricas?.desgloseBancos || []}
        totalBancos={hook.metricas?.totalBancos || 0}
        bancoFiltroActual={hook.bancoFiltro}
        onSeleccionarBancoFiltro={(bancoId) => hook.setBancoFiltro(bancoId)}
        formatMoneda={formatMoneda}
      />

      <CambiarMetodoPagoModal
        venta={hook.ventaACambiarPago}
        metodosPago={hook.metodosPago}
        bancos={hook.bancos}
        onCerrar={() => hook.setVentaACambiarPago(null)}
        onConfirmarCambio={hook.handleConfirmarCambioPago}
        formatMoneda={formatMoneda}
      />

      {hook.ticketModalData && (
        <TicketPreviewModal
          datosTicket={hook.ticketModalData}
          onClose={hook.handleCerrarTicketModal}
        />
      )}

      {hook.datosLiquidacionModal && (
        <LiquidacionDomiciliosModal
          datos={hook.datosLiquidacionModal}
          onClose={hook.handleCerrarLiquidacionModal}
        />
      )}
    </div>
  )
}
