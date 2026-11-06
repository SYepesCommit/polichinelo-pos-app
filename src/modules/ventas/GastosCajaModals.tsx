import React, { useState } from 'react'
import { MinusCircle, TrendingDown, Trash2 } from 'lucide-react'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'
import { GastosCajaModalsProps } from '@/types/ventas/ventas.types'

export const GastosCajaModals: React.FC<GastosCajaModalsProps> = (props) => {
  const [pidiendoPinRegistrarGasto, setPidiendoPinRegistrarGasto] = useState(false)
  const [pidiendoPinEliminarGastoId, setPidiendoPinEliminarGastoId] = useState<number | null>(null)

  const handleSubmitFormGasto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!props.conceptoGasto.trim() || !props.montoGasto) return
    setPidiendoPinRegistrarGasto(true)
  }

  const handleProcederRegistrarGastoConPin = () => {
    setPidiendoPinRegistrarGasto(false)
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
    props.handleGuardarGasto(fakeEvent)
  }

  const handleProcederEliminarGastoConPin = () => {
    if (pidiendoPinEliminarGastoId !== null) {
      props.handleEliminarGasto(pidiendoPinEliminarGastoId)
      setPidiendoPinEliminarGastoId(null)
    }
  }

  return (
    <>
      {/* MODAL: REGISTRAR GASTO / SALIDA */}
      {props.modalGastoAbierto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 mb-1">
              <MinusCircle className="w-5 h-5 text-rose-500" /> Retiro de Dinero
            </h3>
            <p className="text-xs text-slate-400 mb-5">El monto se restará del efectivo en caja.</p>

            <form onSubmit={handleSubmitFormGasto} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Concepto / Motivo *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={props.conceptoGasto}
                  onChange={(e) => props.setConceptoGasto(e.target.value)}
                  placeholder="Ej. Compra de insumos, Pago..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Monto ($) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={props.montoGasto}
                  onChange={(e) => props.setMontoGasto(e.target.value)}
                  placeholder="15000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-400 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => props.setModalGastoAbierto(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={props.guardandoGasto}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                >
                  {props.guardandoGasto ? 'Guardando...' : 'Autorizar con PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER LISTADO COMPLETO DE GASTOS */}
      {props.modalDetalleGastosAbierto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                  Salidas de Caja Registradas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => props.setModalDetalleGastosAbierto(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold p-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-4 custom-scrollbar">
              {props.cargandoGastos ? (
                <div className="text-center py-8 text-xs text-slate-500">Cargando salidas...</div>
              ) : props.listaGastos.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-bold">
                  No hay salidas de dinero registradas en este período.
                </div>
              ) : (
                props.listaGastos.map((gasto) => (
                  <div
                    key={gasto.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-slate-200 block">
                        {gasto.descripcion}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {new Date(gasto.fechaRegistro).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-rose-400">
                        -${props.formatMoneda(gasto.monto)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPidiendoPinEliminarGastoId(gasto.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition active:scale-95"
                        title="Eliminar gasto (Requiere PIN)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Total Egresos:
              </span>
              <span className="text-lg font-black text-rose-400">
                -${props.formatMoneda(props.totalGastos)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN SUPERVISOR: AUTORIZAR REGISTRO DE GASTO */}
      {pidiendoPinRegistrarGasto && (
        <PinSupervisorModal
          titulo="Autorizar Retiro de Caja"
          descripcion={`Ingresa el PIN de supervisor para retirar $${props.formatMoneda(
            Number(props.montoGasto || 0)
          )} (${props.conceptoGasto})`}
          onExito={handleProcederRegistrarGastoConPin}
          onCancelar={() => setPidiendoPinRegistrarGasto(false)}
        />
      )}

      {/* MODAL PIN SUPERVISOR: AUTORIZAR BORRADO DE GASTO */}
      {pidiendoPinEliminarGastoId !== null && (
        <PinSupervisorModal
          titulo="Autorizar Eliminación de Gasto"
          descripcion="Ingresa el PIN de supervisor para revertir o eliminar esta salida de caja"
          onExito={handleProcederEliminarGastoConPin}
          onCancelar={() => setPidiendoPinEliminarGastoId(null)}
        />
      )}
    </>
  )
}
