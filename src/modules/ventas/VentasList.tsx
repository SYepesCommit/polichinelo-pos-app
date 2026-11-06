import React from 'react'
import {
  FileText,
  Printer,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Banknote,
  CreditCard,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Pencil,
  Phone,
  MapPin,
  Navigation,
} from 'lucide-react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { VentasListProps } from '@/types/ventas/ventas.types'

export const VentasList: React.FC<VentasListProps> = ({
  cargando,
  ventasFiltradas,
  modoFecha,
  ventaExpandidaId,
  toggleExpandir,
  handleReimprimir,
  setVentaADesanular,
  handleAbrirAnulacion,
  handleAbrirCambiarPago,
  formatMoneda,
}) => {
  const renderIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'MESA':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
      case 'LLEVAR':
        return <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
      case 'DOMICILIO':
        return <Bike className="w-3.5 h-3.5 text-emerald-400" />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar relative">
      {cargando ? (
        <LoadingScreen mensaje="Consultando registros de ventas..." />
      ) : ventasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800/80 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-40" />
          <p className="text-xs text-slate-400 font-bold">
            No hay registros de ventas para el criterio seleccionado.
          </p>
        </div>
      ) : (
        ventasFiltradas.map((v) => {
          const esAnulado = v.estado === 'ANULADO'
          const esEfectivo = v.metodoPago?.toUpperCase().includes('EFECTIVO')
          const estaExpandido = ventaExpandidaId === v.id
          const cantidadItems = (v.items || []).reduce(
            (acc: number, it: any) => acc + (it.cantidad || 1),
            0
          )

          const tieneDatosEntrega =
            Boolean(v.cliente?.telefono) ||
            Boolean(v.cliente?.direccion) ||
            Boolean(v.cliente?.referenciaDireccion)

          return (
            <div
              key={v.id}
              className={`rounded-2xl border transition overflow-hidden shadow-sm ${
                esAnulado
                  ? 'bg-rose-950/10 border-rose-500/20 opacity-80'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-center min-w-[90px] shrink-0">
                    <span className="text-[10px] font-black text-amber-400 uppercase block">
                      #{v.consecutivo}
                    </span>
                    <span className="text-xs font-bold text-slate-300 block">{v.hora}</span>
                    {modoFecha === 'RANGO' && (
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                        {v.fecha}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-100">
                        {v.nombreCliente || 'Cliente Mostrador'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                        {renderIconoTipo(v.tipoPedido)}
                        <span>{v.tipoPedido}</span>
                      </span>
                      {esAnulado ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            ANULADO
                          </span>
                          {v.motivoAnulacion && (
                            <span className="text-[10px] text-rose-300 font-medium italic">
                              ({v.motivoAnulacion})
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <button
                        type="button"
                        disabled={esAnulado}
                        onClick={() => !esAnulado && handleAbrirCambiarPago(v)}
                        title={
                          esAnulado
                            ? 'Pedido anulado'
                            : 'Toca aquí para cambiar el medio de pago (Requiere PIN)'
                        }
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border shadow-sm transition ${
                          esAnulado
                            ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-default'
                            : esEfectivo
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/35 hover:border-emerald-400 active:scale-95 cursor-pointer'
                            : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/35 hover:border-purple-400 active:scale-95 cursor-pointer'
                        }`}
                      >
                        {esEfectivo ? (
                          <>
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Efectivo</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Transferencia:</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/40 text-purple-100 font-black uppercase tracking-wide text-[10px]">
                              {v.bancoNombre || 'Sin especificar'}
                            </span>
                          </>
                        )}
                        {!esAnulado && (
                          <span className="ml-1 pl-1.5 border-l border-current/25 inline-flex items-center gap-0.5 text-[10px] font-extrabold opacity-85">
                            <Pencil className="w-2.5 h-2.5" />
                            <span>Cambiar</span>
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpandir(v.id)}
                        className="text-[11px] font-bold text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 transition flex items-center gap-1 active:scale-95"
                      >
                        <span>
                          {cantidadItems} {cantidadItems === 1 ? 'ítem' : 'ítems'}
                        </span>
                        {estaExpandido ? (
                          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {v.cliente?.telefono && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800/80">
                          <Phone className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{v.cliente.telefono}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Total
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      ${formatMoneda(v.montoTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReimprimir(v)}
                      disabled={esAnulado}
                      className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-xl transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                      title="Reimprimir Tiquete"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {esAnulado ? (
                      <button
                        type="button"
                        onClick={() => setVentaADesanular(v)}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition active:scale-95"
                        title="Restaurar / Desanular Pedido"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAbrirAnulacion(v)}
                        className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-slate-950 rounded-xl transition active:scale-95"
                        title="Anular Pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ACORDEÓN DESPLEGABLE CON DETALLE DE ENTREGA Y PRODUCTOS */}
              {estaExpandido && (
                <div className="bg-slate-950/70 border-t border-slate-800/80 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="max-w-3xl space-y-3">
                    {tieneDatosEntrega && (
                      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center gap-4 text-xs">
                        {v.cliente?.telefono && (
                          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Tel: {v.cliente.telefono}</span>
                          </div>
                        )}
                        {v.cliente?.direccion && (
                          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Dirección: {v.cliente.direccion}</span>
                          </div>
                        )}
                        {v.cliente?.referenciaDireccion && (
                          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                            <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>Ref: {v.cliente.referenciaDireccion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 block mb-2">
                        Detalle de la Comanda
                      </span>
                      <div className="space-y-1.5">
                        {(v.items || []).map((it: any, idx: number) => {
                          const nombreProd = it.producto?.nombre || it.nombre || 'Producto'
                          return (
                            <div
                              key={idx}
                              className="flex items-start justify-between text-xs py-1 border-b border-slate-900 last:border-b-0"
                            >
                              <div>
                                <span className="font-extrabold text-slate-200">
                                  {it.cantidad}x {nombreProd}
                                </span>
                                {it.observaciones && (
                                  <span className="text-[11px] text-amber-300/80 font-medium block pl-4 italic">
                                    ↳ {it.observaciones}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-300">
                                ${formatMoneda(it.subtotal || it.precioUnitario * it.cantidad)}
                              </span>
                            </div>
                          )
                        })}
                        {v.tipoPedido === 'DOMICILIO' && (v.montoDomicilio || 0) > 0 && (
                          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800/60 font-semibold text-emerald-400">
                            <span>🛵 Recargo de Domicilio</span>
                            <span>+${formatMoneda(v.montoDomicilio || 0)}</span>
                          </div>
                        )}
                        {v.observacionesGenerales && (
                          <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                            <span className="font-bold text-amber-400">Nota general: </span>
                            {v.observacionesGenerales}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
