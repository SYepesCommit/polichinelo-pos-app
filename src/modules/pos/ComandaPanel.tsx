import React from 'react'
import {
  ShoppingBag,
  PlusCircle,
  Truck,
  Building2,
  Settings2,
  ChevronDown,
  Check,
  AlertCircle,
  QrCode,
  CreditCard,
  Wallet,
  Banknote,
  Trash2,
  Coins,
  X,
  Split,
} from 'lucide-react'

import { ComandaItemCard } from './ComandaItemCard'
import { BancoModal } from './BancoModal'
import { ItemLibreModal } from './ItemLibreModal'
import { ComandaPanelProps } from '@/types/pos/comandaPanel.types'
import { useComandaPanel } from '@/hooks/pos/useComandaPanel'

export const ComandaPanel: React.FC<ComandaPanelProps> = (props) => {
  const {
    carrito,
    tipoPedido,
    montoDomicilio,
    setMontoDomicilio,
    metodosPago,
    metodoPagoSeleccionado,
    setMetodoPagoSeleccionado,
    bancos,
    bancoSeleccionado,
    setBancoSeleccionado,
    total,
    onCambiarCantidad,
    onEliminarItem,
    onEditarItem,
    onVaciarCarrito,
    cobrando = false,
    onCobrar,
    onActualizarBancos,
  } = props

  const {
    mostrarModalBancos,
    setMostrarModalBancos,
    dropdownBancosAbierto,
    setDropdownBancosAbierto,
    mostrarModalItemLibre,
    setMostrarModalItemLibre,
    nombreItemLibre,
    setNombreItemLibre,
    precioItemLibre,
    setPrecioItemLibre,
    confirmandoVaciar,
    handleVaciarClick,
    montoRecibido,
    setMontoRecibido,
    esPagoMixto,
    setEsPagoMixto,
    montoTransferenciaMixto,
    setMontoTransferenciaMixto,
    montoEfectivoMixto,
    baseEfectivoACobrar,
    requiereSeleccionarBanco,
    esEfectivo,
    cambio,
    dropdownRef,
    formatMoneda,
    handleAgregarItemLibreSubmit,
    esFormularioValido,
    mensajeFaltante,
  } = useComandaPanel(props)

  const getIconoMetodo = (codigo: string) => {
    const c = codigo.toUpperCase()
    if (c.includes('TRANSFERENCIA') || c.includes('NEQUI')) return <QrCode className="w-4 h-4 shrink-0" />
    if (c.includes('TARJETA') || c.includes('DATAFONO')) return <CreditCard className="w-4 h-4 shrink-0" />
    if (c.includes('BONO') || c.includes('PUNTOS')) return <Wallet className="w-4 h-4 shrink-0" />
    return <Banknote className="w-4 h-4 shrink-0" />
  }

  const bancoActual = bancos.find((b) => b.id === bancoSeleccionado)

  return (
    <>
      <div className="w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col justify-between h-full p-6 shrink-0 overflow-hidden select-none">
        {/* SECCIÓN SUPERIOR E ÍTEMS DE CARRITO */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg font-extrabold text-slate-100">Comanda</h2>
            </div>

            <div className="flex items-center gap-1.5">
              {carrito.length > 0 && onVaciarCarrito && (
                <button
                  type="button"
                  onClick={handleVaciarClick}
                  title="Vaciar toda la comanda"
                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-bold flex items-center gap-1 transition touch-manipulation active:scale-95 ${
                    confirmandoVaciar
                      ? 'bg-red-500 text-slate-950 border-red-400 font-black shadow-md shadow-red-500/20'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmandoVaciar ? '¿Vaciar? Sí' : 'Vaciar'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMostrarModalItemLibre(true)}
                className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-xl border border-amber-500/30 font-bold flex items-center gap-1 transition touch-manipulation active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Libre</span>
              </button>
            </div>
          </div>

          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Toca un producto para agregarlo</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
              {carrito.map((item: any) => (
                <ComandaItemCard
                  key={item.idTemp}
                  item={item}
                  formatMoneda={formatMoneda}
                  onEditarItem={onEditarItem}
                  onCambiarCantidad={onCambiarCantidad}
                  onEliminarItem={onEliminarItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN DE COBRO ANCLADA INFERIOR */}
        <div className="border-t border-slate-800 pt-3 mt-3 shrink-0">
          {tipoPedido === 'DOMICILIO' && (
            <div className="mb-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-300">Valor Domicilio:</span>
                </div>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={montoDomicilio || ''}
                    onChange={(e) =>
                      setMontoDomicilio && setMontoDomicilio(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-xs font-black text-amber-400 text-right focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-900">
                {[3000, 4000, 5000, 6000, 7000].map((valor) => {
                  const esSeleccionado = montoDomicilio === valor
                  return (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setMontoDomicilio && setMontoDomicilio(valor)}
                      className={`py-1 rounded-lg text-[11px] font-extrabold transition touch-manipulation active:scale-95 ${
                        esSeleccionado
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      ${valor / 1000}k
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <label className="text-xs font-extrabold text-slate-400 block mb-2 uppercase tracking-wider">
            Método de Pago:
          </label>

          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {metodosPago.map((mp: any) => {
              const esSeleccionado = !esPagoMixto && metodoPagoSeleccionado?.id === mp.id
              return (
                <button
                  key={mp.id}
                  type="button"
                  onClick={() => {
                    setEsPagoMixto(false)
                    setMetodoPagoSeleccionado(mp)
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
                    esSeleccionado
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {getIconoMetodo(mp.codigo)}
                  <span className="truncate">{mp.nombre}</span>
                </button>
              )
            })}

            {/* Botón Pago Mixto (Efectivo + Transferencia) */}
            <button
              type="button"
              onClick={() => {
                setEsPagoMixto(true)
                if (!montoTransferenciaMixto && total > 0) {
                  const mitad = Math.floor(total / 2000) * 1000
                  if (mitad > 0 && mitad < total) {
                    setMontoTransferenciaMixto(mitad)
                    setMontoRecibido(total - mitad)
                  }
                }
              }}
              className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
                esPagoMixto
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
              title="Dividir cobro entre Efectivo y Transferencia"
            >
              <Split className="w-4 h-4 shrink-0" />
              <span className="truncate">Mixto</span>
            </button>
          </div>

          {/* DROPDOWN DE BANCOS (Transferencia o Mixto) */}
          {requiereSeleccionarBanco && (
            <div className="mb-3 relative" ref={dropdownRef}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-400">
                  {esPagoMixto ? 'Banco para la Transferencia:' : 'Banco / Entidad Destino:'}
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarModalBancos(true)}
                  className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 touch-manipulation active:scale-95"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Gestionar</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDropdownBancosAbierto(!dropdownBancosAbierto)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2 flex items-center justify-between transition focus:outline-none focus:border-amber-500"
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {bancoActual ? bancoActual.nombre : 'Seleccionar banco...'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    dropdownBancosAbierto ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              {dropdownBancosAbierto && (
                <div className="absolute bottom-full mb-1 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto p-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {bancos.length === 0 ? (
                    <div className="text-xs text-slate-500 p-3 text-center">
                      No hay bancos registrados
                    </div>
                  ) : (
                    bancos.map((b: any) => {
                      const seleccionado = b.id === bancoSeleccionado
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBancoSeleccionado(b.id)
                            setDropdownBancosAbierto(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            seleccionado
                              ? 'bg-amber-500/10 text-amber-400 font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <span className="truncate">{b.nombre}</span>
                          {seleccionado && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* DESGLOSE DE PAGO MIXTO (TRANSFERENCIA + EFECTIVO) */}
          {esPagoMixto && total > 0 && (
            <div className="mb-3 bg-slate-950 p-2.5 rounded-xl border border-sky-500/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-200">
                    Por Transferencia <span className="text-rose-400">*</span>:
                  </span>
                </div>
                <div className="relative w-36 flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-slate-500 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    step="1000"
                    value={montoTransferenciaMixto || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      setMontoTransferenciaMixto(val)
                      const nuevoEfvo = Math.max(0, total - val)
                      setMontoRecibido(nuevoEfvo)
                    }}
                    placeholder="Monto banco..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-6 py-1 text-xs font-black text-sky-400 text-right focus:outline-none focus:border-sky-500"
                  />
                  {montoTransferenciaMixto > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMontoTransferenciaMixto(0)
                        setMontoRecibido(0)
                      }}
                      title="Limpiar transferencia"
                      className="absolute right-1.5 text-slate-500 hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs">
                <span className="font-bold text-emerald-300">Restante en Efectivo:</span>
                <span className="font-black text-emerald-400">
                  ${formatMoneda(montoEfectivoMixto)}
                </span>
              </div>
            </div>
          )}

          {/* CALCULADORA TÁCTIL DE CAMBIO / VUELTOS (EFECTIVO O PARTE EN EFECTIVO DEL MIXTO) */}
          {(esEfectivo || (esPagoMixto && montoEfectivoMixto > 0)) && total > 0 && (
            <div
              className={`mb-3 bg-slate-950 p-2.5 rounded-xl border space-y-2 transition ${
                !montoRecibido || montoRecibido < baseEfectivoACobrar
                  ? 'border-amber-500/40'
                  : 'border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-200">
                    {esPagoMixto ? 'Paga efectivo con' : 'Paga con'}{' '}
                    <span className="text-rose-400">*</span>:
                  </span>
                </div>
                <div className="relative w-36 flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-slate-500 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={montoRecibido || ''}
                    onChange={(e) => setMontoRecibido(parseFloat(e.target.value) || 0)}
                    placeholder="Obligatorio..."
                    className={`w-full bg-slate-900 border rounded-lg pl-6 pr-6 py-1 text-xs font-black text-emerald-400 text-right focus:outline-none ${
                      !montoRecibido || montoRecibido < baseEfectivoACobrar
                        ? 'border-amber-500/50 focus:border-amber-400 placeholder:text-amber-500/50'
                        : 'border-slate-800 focus:border-emerald-500'
                    }`}
                  />
                  {montoRecibido > 0 && (
                    <button
                      type="button"
                      onClick={() => setMontoRecibido(0)}
                      title="Limpiar monto"
                      className="absolute right-1.5 text-slate-500 hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Botones rápidos de billetes colombianos */}
              <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setMontoRecibido(baseEfectivoACobrar)}
                  className={`py-1 rounded-lg text-[10px] font-extrabold transition touch-manipulation active:scale-95 ${
                    montoRecibido === baseEfectivoACobrar
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Exacto
                </button>
                {[10000, 20000, 50000, 100000].map((billete) => {
                  const esActivo = montoRecibido === billete
                  return (
                    <button
                      key={billete}
                      type="button"
                      onClick={() => setMontoRecibido(billete)}
                      className={`py-1 rounded-lg text-[10px] font-extrabold transition touch-manipulation active:scale-95 ${
                        esActivo
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      ${billete / 1000}k
                    </button>
                  )
                })}
              </div>

              {/* Resultado de Vueltos / Cambio */}
              {montoRecibido > 0 && (
                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-extrabold border ${
                    cambio >= 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <span>{cambio >= 0 ? 'Cambio a devolver:' : 'Faltan por cubrir:'}</span>
                  <span className="text-sm font-black">
                    ${formatMoneda(Math.abs(cambio))}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 font-semibold text-sm">Total a Pagar</span>
            <span className="text-2xl font-black text-amber-400">
              ${formatMoneda(total)}
            </span>
          </div>

          {mensajeFaltante && (
            <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold flex items-center gap-1.5 justify-center">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{mensajeFaltante}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              onCobrar(
                esPagoMixto
                  ? {
                      esMixto: true,
                      montoEfectivoMixto,
                      montoTransferenciaMixto,
                      montoRecibido,
                      cambio: cambio >= 0 ? cambio : 0,
                    }
                  : esEfectivo && montoRecibido > 0
                  ? { montoRecibido, cambio: cambio >= 0 ? cambio : 0 }
                  : undefined
              )
            }
            disabled={!esFormularioValido || cobrando}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm uppercase tracking-wider touch-manipulation active:scale-[0.99]"
          >
            {cobrando ? 'PROCESANDO COBRO...' : `COBRAR ($${formatMoneda(total)})`}
          </button>
        </div>
      </div>

      {/* MODAL GESTIÓN DE BANCOS */}
      {mostrarModalBancos && (
        <BancoModal
          bancos={bancos}
          onClose={() => setMostrarModalBancos(false)}
          onBancoAgregado={() => {
            if (onActualizarBancos) onActualizarBancos()
          }}
        />
      )}

      {/* MODAL AGREGAR ÍTEM LIBRE */}
      {mostrarModalItemLibre && (
        <ItemLibreModal
          nombreItemLibre={nombreItemLibre}
          setNombreItemLibre={setNombreItemLibre}
          precioItemLibre={precioItemLibre}
          setPrecioItemLibre={setPrecioItemLibre}
          onClose={() => setMostrarModalItemLibre(false)}
          onSubmit={handleAgregarItemLibreSubmit}
        />
      )}
    </>
  )
}
