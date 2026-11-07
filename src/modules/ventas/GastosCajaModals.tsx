import React, { useState } from 'react'
import { MinusCircle, TrendingDown, Trash2, Banknote, Smartphone, RotateCcw } from 'lucide-react'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'
import { GastosCajaModalsProps } from '@/types/ventas/ventas.types'

const MOTIVOS_RAPIDOS = [
  'Insumos / Mercado',
  'Pago Domiciliario',
  'Bebidas / Hielo',
  'Desechables / Aseo',
  'Nómina / Turno',
  'Servicios / Otros',
]

const MONTOS_RAPIDOS = [5000, 10000, 20000, 50000]

export const GastosCajaModals: React.FC<GastosCajaModalsProps> = (props) => {
  const [motivoRapidoSeleccionado, setMotivoRapidoSeleccionado] = useState<string>('')
  const [pidiendoPinEliminarGastoId, setPidiendoPinEliminarGastoId] = useState<number | null>(null)

  const conceptoCombinado = (() => {
    const detalle = props.conceptoGasto.trim()
    if (motivoRapidoSeleccionado && detalle) {
      return `${motivoRapidoSeleccionado}: ${detalle}`
    }
    if (motivoRapidoSeleccionado) {
      return motivoRapidoSeleccionado
    }
    return detalle
  })()

  const montoNumerico = Number(props.montoGasto || 0)

  const handleSumarMontoRapido = (valor: number) => {
    const actual = Number(props.montoGasto || 0)
    props.setMontoGasto(String(actual + valor))
  }

  const handleCerrarModalRegistro = () => {
    setMotivoRapidoSeleccionado('')
    props.setModalGastoAbierto(false)
  }

  const handleSubmitFormGasto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!conceptoCombinado || montoNumerico <= 0) return
    props.handleGuardarGasto(e, conceptoCombinado)
    setMotivoRapidoSeleccionado('')
  }

  const handleProcederEliminarGastoConPin = () => {
    if (pidiendoPinEliminarGastoId !== null) {
      props.handleEliminarGasto(pidiendoPinEliminarGastoId)
      setPidiendoPinEliminarGastoId(null)
    }
  }

  const formatearFechaHoraGasto = (fechaRaw: string | Date) => {
    const fechaObj = new Date(fechaRaw)
    const fechaStr = fechaObj.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const horaStr = fechaObj.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${fechaStr} · ${horaStr}`
  }

  return (
    <>
      {/* MODAL: REGISTRAR GASTO / SALIDA */}
      {props.modalGastoAbierto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 mb-1">
              <MinusCircle className="w-5 h-5 text-rose-500" /> Registrar Salida / Gasto
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Selecciona de dónde sale el dinero y el motivo del retiro.
            </p>

            <form onSubmit={handleSubmitFormGasto} className="space-y-4">
              {/* ORIGEN DEL DINERO: EFECTIVO CAJA VS TRANSFERENCIA */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  ¿De dónde sale el dinero?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => props.setOrigenFondosGasto('EFECTIVO')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 ${
                      props.origenFondosGasto === 'EFECTIVO'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo de Caja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => props.setOrigenFondosGasto('TRANSFERENCIA')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 ${
                      props.origenFondosGasto === 'TRANSFERENCIA'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Transferencia / Banco</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {props.origenFondosGasto === 'EFECTIVO'
                    ? 'Se descontará de los billetes físicos esperados en caja.'
                    : 'Quedará registrado en gastos sin descuadrar los billetes físicos de la caja.'}
                </p>
              </div>

              {/* CHIPS DE MOTIVOS FRECUENTES */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Categoría rápida (Opcional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MOTIVOS_RAPIDOS.map((motivo) => {
                    const activo = motivoRapidoSeleccionado === motivo
                    return (
                      <button
                        key={motivo}
                        type="button"
                        onClick={() =>
                          setMotivoRapidoSeleccionado((prev) => (prev === motivo ? '' : motivo))
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition active:scale-95 ${
                          activo
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {motivo}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* DETALLE / CONCEPTO */}
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  {motivoRapidoSeleccionado
                    ? `Detalle adicional para "${motivoRapidoSeleccionado}" (Opcional)`
                    : 'Concepto / Motivo *'}
                </label>
                <input
                  type="text"
                  required={!motivoRapidoSeleccionado}
                  value={props.conceptoGasto}
                  onChange={(e) => props.setConceptoGasto(e.target.value)}
                  placeholder={
                    motivoRapidoSeleccionado
                      ? 'Ej. Nombre del proveedor o domiciliario...'
                      : 'Ej. Compra de bolsas, pago hielo...'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* MONTO CON BOTONES RÁPIDOS Y PREVIEW DE MILES */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Monto ($) *
                  </label>
                  {montoNumerico > 0 && (
                    <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                      ${props.formatMoneda(montoNumerico)}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    required
                    min="50"
                    step="50"
                    value={props.montoGasto}
                    onChange={(e) => props.setMontoGasto(e.target.value)}
                    placeholder="15000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-black text-rose-400 focus:border-rose-500 focus:outline-none pr-10"
                  />
                  {props.montoGasto && (
                    <button
                      type="button"
                      onClick={() => props.setMontoGasto('')}
                      className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300 rounded-lg"
                      title="Limpiar monto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {MONTOS_RAPIDOS.map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => handleSumarMontoRapido(valor)}
                      className="py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-extrabold text-slate-300 transition active:scale-95"
                    >
                      +${props.formatMoneda(valor)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCerrarModalRegistro}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={props.guardandoGasto || !conceptoCombinado || montoNumerico <= 0}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                >
                  {props.guardandoGasto ? 'Guardando...' : 'Guardar Salida'}
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
                props.listaGastos.map((gasto) => {
                  const esTransf = gasto.origenFondos === 'TRANSFERENCIA'
                  return (
                    <div
                      key={gasto.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-200">
                            {gasto.descripcion}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                              esTransf
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {esTransf ? 'Transferencia' : 'Efectivo Caja'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          {formatearFechaHoraGasto(gasto.fechaRegistro)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
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
                  )
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-1.5">
              {(props.totalGastosTransferencia || 0) > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                  <span>Salidas de Efectivo (Caja):</span>
                  <span className="text-rose-300">
                    -${props.formatMoneda(props.totalGastosEfectivo || 0)}
                  </span>
                </div>
              )}
              {(props.totalGastosTransferencia || 0) > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                  <span>Salidas por Transferencia / Banco:</span>
                  <span className="text-purple-300">
                    -${props.formatMoneda(props.totalGastosTransferencia || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Total Egresos:
                </span>
                <span className="text-lg font-black text-rose-400">
                  -${props.formatMoneda(props.totalGastos)}
                </span>
              </div>
            </div>
          </div>
        </div>
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
