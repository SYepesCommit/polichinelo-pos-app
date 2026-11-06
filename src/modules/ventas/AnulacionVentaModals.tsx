import React, { useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'
import { AnulacionVentaModalsProps } from '@/types/ventas/ventas.types'

const MOTIVOS_ANULACION_RAPIDOS = [
  'Error de digitación en caja',
  'Cliente canceló el pedido',
  'Cobro duplicado',
  'Problema con el plato / cocina',
]

export const AnulacionVentaModals: React.FC<AnulacionVentaModalsProps> = (props) => {
  const [pidiendoPinAnulacion, setPidiendoPinAnulacion] = useState(false)
  const [pidiendoPinDesanulacion, setPidiendoPinDesanulacion] = useState(false)

  const handleProcederAnulacionConPin = () => {
    setPidiendoPinAnulacion(false)
    props.handleConfirmarAnulacion()
  }

  const handleProcederDesanulacionConPin = () => {
    setPidiendoPinDesanulacion(false)
    props.handleConfirmarDesanulacion()
  }

  return (
    <>
      {/* DIÁLOGO CONFIRMACIÓN ANULACIÓN CON MOTIVOS */}
      {props.ventaAAnular && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              ¿Anular Venta #{props.ventaAAnular.consecutivo}?
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
              El valor de{' '}
              <strong className="text-amber-400">
                ${props.formatMoneda(props.ventaAAnular.montoTotal)}
              </strong>{' '}
              se descontará del arqueo de caja.
            </p>

            <div className="text-left mb-5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Selecciona el Motivo de Anulación:
              </label>
              <div className="space-y-1.5 mb-2">
                {MOTIVOS_ANULACION_RAPIDOS.map((motivo) => (
                  <button
                    key={motivo}
                    type="button"
                    onClick={() => props.setMotivoAnulacion(motivo)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      props.motivoAnulacion === motivo
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {motivo}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => props.setMotivoAnulacion('OTRO')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    props.motivoAnulacion === 'OTRO'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Otro motivo específico...
                </button>
              </div>
              {props.motivoAnulacion === 'OTRO' && (
                <input
                  type="text"
                  autoFocus
                  value={props.otroMotivo}
                  onChange={(e) => props.setOtroMotivo(e.target.value)}
                  placeholder="Escribe el motivo de la anulación..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => props.setVentaAAnular(null)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setPidiendoPinAnulacion(true)}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Autorizar con PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO CONFIRMACIÓN DESANULACIÓN */}
      {props.ventaADesanular && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              ¿Restaurar Venta #{props.ventaADesanular.consecutivo}?
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
              El pedido volverá al estado activo y el valor de{' '}
              <strong className="text-amber-400">
                ${props.formatMoneda(props.ventaADesanular.montoTotal)}
              </strong>{' '}
              se sumará al arqueo de caja.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => props.setVentaADesanular(null)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setPidiendoPinDesanulacion(true)}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Autorizar con PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN SUPERVISOR: AUTORIZAR ANULACIÓN */}
      {pidiendoPinAnulacion && (
        <PinSupervisorModal
          titulo="Autorizar Anulación"
          descripcion={`Ingresa el PIN de supervisor para anular la venta #${props.ventaAAnular?.consecutivo}`}
          onExito={handleProcederAnulacionConPin}
          onCancelar={() => setPidiendoPinAnulacion(false)}
        />
      )}

      {/* MODAL PIN SUPERVISOR: AUTORIZAR DESANULACIÓN */}
      {pidiendoPinDesanulacion && (
        <PinSupervisorModal
          titulo="Autorizar Restauración"
          descripcion={`Ingresa el PIN de supervisor para restaurar la venta #${props.ventaADesanular?.consecutivo}`}
          onExito={handleProcederDesanulacionConPin}
          onCancelar={() => setPidiendoPinDesanulacion(false)}
        />
      )}
    </>
  )
}
