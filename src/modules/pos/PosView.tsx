import React from 'react'
import { usePosState } from '../../hooks/pos/usePosState'
import { PedidoHeader } from './PedidoHeader'
import { CategoriasBar } from './CategoriasBar'
import { ProductGrid } from './ProductGrid'
import { ComandaPanel } from './ComandaPanel'
import { NoteModal } from './NoteModal'
import { PlatoDelDiaModal } from './PlatoDelDiaModal'
import { NuevoEspecialModal } from './NuevoEspecialModal'
import { TicketPreviewModal } from './TicketPreviewModal'
import { WhatsAppParserModal } from './WhatsAppParserModal'

export const PosView: React.FC = () => {
  const pos = usePosState()

  const esNuevoItem = pos.productoAEditar
    ? !pos.carrito.some((item) => item.idTemp === pos.productoAEditar?.idTemp)
    : false

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <PedidoHeader
          tipoPedido={pos.tipoPedido}
          setTipoPedido={pos.setTipoPedido}
          nombreCliente={pos.nombreCliente}
          setNombreCliente={pos.setNombreCliente}
          telefono={pos.telefono}
          handleTelefonoChange={pos.handleTelefonoChange}
          direccionCliente={pos.direccionCliente}
          setDireccionCliente={pos.setDireccionCliente}
          referenciaCliente={pos.referenciaCliente}
          setReferenciaCliente={pos.setReferenciaCliente}
          clienteExiste={pos.clienteExiste}
          handleBuscarCliente={pos.handleBuscarCliente}
          observacionesGenerales={pos.observacionesGenerales}
          setObservacionesGenerales={pos.setObservacionesGenerales}
          onAbrirWhatsAppModal={() => pos.setMostrarModalWhatsApp(true)}
          onPegarTelefonoRapido={pos.handlePegarTelefonoRapido}
          ultimoPedidoCliente={pos.ultimoPedidoCliente}
          onRepetirUltimoPedido={pos.handleRepetirUltimoPedido}
        />

        <CategoriasBar
          categorias={pos.categorias}
          categoriaActiva={pos.categoriaActiva}
          setCategoriaActiva={pos.setCategoriaActiva}
          busquedaPos={pos.busquedaPos}
          setBusquedaPos={pos.setBusquedaPos}
          onAbrirModalEspeciales={() => pos.setMostrarModalEspeciales(true)}
        />

        <ProductGrid
          productos={pos.productosActuales}
          categoriaActiva={pos.categoriaActiva}
          onAgregarRapido={pos.agregarProductoRapido}
          onAbrirPersonalizacion={pos.handleAbrirPersonalizacion}
          onAbrirNuevoEspecial={() => pos.setMostrarModalNuevoEspecial(true)}
        />
      </div>

      <ComandaPanel
        carrito={pos.carrito}
        tipoPedido={pos.tipoPedido}
        nombreCliente={pos.nombreCliente}
        telefono={pos.telefono}
        direccionCliente={pos.direccionCliente}
        referenciaCliente={pos.referenciaCliente}
        montoDomicilio={pos.montoDomicilio}
        setMontoDomicilio={pos.setMontoDomicilio}
        metodosPago={pos.metodosPago}
        metodoPagoSeleccionado={pos.metodoPagoSeleccionado}
        setMetodoPagoSeleccionado={pos.setMetodoPagoSeleccionado}
        bancos={pos.bancos}
        bancoSeleccionado={pos.bancoSeleccionado}
        setBancoSeleccionado={pos.setBancoSeleccionado}
        total={pos.total}
        onCambiarCantidad={pos.cambiarCantidad}
        onEliminarItem={pos.eliminarItem}
        onEditarItem={pos.setProductoAEditar}
        onAgregarItemLibre={pos.handleAgregarItemLibre}
        onVaciarCarrito={() => pos.setCarrito([])}
        cobrando={pos.cobrando}
        onCobrar={pos.handleCobrar}
        onActualizarBancos={pos.cargarBancosBD}
      />

      {pos.productoAEditar && (
        <NoteModal
          productoAEditar={pos.productoAEditar}
          setProductoAEditar={pos.setProductoAEditar}
          adicionesDisponibles={pos.adicionesDesdeBD}
          onGuardarObservacion={pos.guardarObservacion}
          esNuevoItem={esNuevoItem}
        />
      )}

      {pos.mostrarModalEspeciales && (
        <PlatoDelDiaModal
          categorias={pos.categorias}
          onClose={() => pos.setMostrarModalEspeciales(false)}
          onToggleEspecial={pos.handleToggleEspecial}
          onDesactivarProducto={pos.handleDesactivarEspecial}
        />
      )}

      {pos.mostrarModalNuevoEspecial && (
        <NuevoEspecialModal
          categorias={pos.categorias}
          categoriaActivaId={pos.categoriaActiva}
          onClose={() => pos.setMostrarModalNuevoEspecial(false)}
          onGuardarEspecial={pos.handleGuardarProductoEspecial}
        />
      )}

      {pos.ticketParaImprimir && (
        <TicketPreviewModal
          datosTicket={pos.ticketParaImprimir}
          onClose={() => pos.setTicketParaImprimir(null)}
        />
      )}

      {pos.mostrarModalWhatsApp && (
        <WhatsAppParserModal
          categorias={pos.categorias}
          adicionesDisponibles={pos.adicionesDesdeBD}
          metodosPago={pos.metodosPago}
          bancos={pos.bancos}
          onCerrar={() => pos.setMostrarModalWhatsApp(false)}
          onAplicarPedidoWhatsApp={pos.handleAplicarPedidoWhatsApp}
        />
      )}
    </div>
  )
}