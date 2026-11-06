import React from 'react'
import { VentasModalsProps } from '@/types/ventas/ventas.types'
import { GastosCajaModals } from './GastosCajaModals'
import { AnulacionVentaModals } from './AnulacionVentaModals'

export const VentasModals: React.FC<VentasModalsProps> = (props) => {
  return (
    <>
      <GastosCajaModals
        modalGastoAbierto={props.modalGastoAbierto}
        setModalGastoAbierto={props.setModalGastoAbierto}
        conceptoGasto={props.conceptoGasto}
        setConceptoGasto={props.setConceptoGasto}
        montoGasto={props.montoGasto}
        setMontoGasto={props.setMontoGasto}
        handleGuardarGasto={props.handleGuardarGasto}
        guardandoGasto={props.guardandoGasto}
        modalDetalleGastosAbierto={props.modalDetalleGastosAbierto}
        setModalDetalleGastosAbierto={props.setModalDetalleGastosAbierto}
        listaGastos={props.listaGastos}
        cargandoGastos={props.cargandoGastos}
        handleEliminarGasto={props.handleEliminarGasto}
        formatMoneda={props.formatMoneda}
        totalGastos={props.totalGastos}
      />

      <AnulacionVentaModals
        ventaAAnular={props.ventaAAnular}
        setVentaAAnular={props.setVentaAAnular}
        motivoAnulacion={props.motivoAnulacion}
        setMotivoAnulacion={props.setMotivoAnulacion}
        otroMotivo={props.otroMotivo}
        setOtroMotivo={props.setOtroMotivo}
        handleConfirmarAnulacion={props.handleConfirmarAnulacion}
        ventaADesanular={props.ventaADesanular}
        setVentaADesanular={props.setVentaADesanular}
        handleConfirmarDesanulacion={props.handleConfirmarDesanulacion}
        formatMoneda={props.formatMoneda}
      />
    </>
  )
}
