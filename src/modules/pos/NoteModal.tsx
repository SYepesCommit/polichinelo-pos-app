import React from 'react'
import { X, Plus, Minus, FileText, Check, Beef, Droplets } from 'lucide-react'
import { NoteModalProps } from '@/types/pos/noteModal.types'
import { useNoteModal, OPCIONES_CARNE, OPCIONES_SALSAS } from '@/hooks/pos/useNoteModal'

export const NoteModal: React.FC<NoteModalProps> = ({
  productoAEditar,
  setProductoAEditar,
  adicionesDisponibles = [],
  onGuardarObservacion,
  esNuevoItem = false,
}) => {
  const {
    requiereCarne,
    carneSeleccionada,
    setCarneSeleccionada,
    salsasSeleccionadas,
    toggleSalsa,
    seleccionarTodasLasSalsas,
    seleccionarSinSalsas,
    ingredientesSin,
    adicionesPAGAS,
    notasGenerales,
    costoAdiciones,
    precioFinalUnitario,
    listaIngredientes,
    setNotasGenerales,
    toggleIngredienteSin,
    cambiarCantidadAdicionPaga,
    handleGuardar,
  } = useNoteModal({
    productoAEditar,
    adicionesDisponibles,
    onGuardarObservacion,
    setProductoAEditar,
  })

  const tieneTodasLasSalsas = OPCIONES_SALSAS.every((s) => salsasSeleccionadas.includes(s))
  const esSinSalsas = salsasSeleccionadas.includes('SIN SALSAS')

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={() => setProductoAEditar(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABECERA */}
        <h3 className="text-xl font-extrabold text-slate-100 mb-1 pr-8">
          Personalizar: <span className="text-amber-400">{productoAEditar.producto.nombre}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
          {requiereCarne
            ? 'Elige las salsas, ingredientes, adiciones o cambia el tipo de carne si lo deseas.'
            : 'Elige las salsas, qué ingredientes quitar, adiciones u observación.'}
        </p>

        {/* 1. SELECCIÓN DE CARNE OPCIONAL (POLLO, TOCINETA, CHURRASCO) */}
        {requiereCarne && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Beef className="w-4 h-4 text-amber-400" />
                <span>Tipo / Cambio de Carne (Opcional)</span>
              </span>
              {carneSeleccionada ? (
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  {carneSeleccionada}
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold normal-case">
                  Carne normal
                </span>
              )}
            </label>
            <p className="text-[11px] text-slate-400 font-medium mb-2.5">
              * Si no se elige ninguna, se da por hecho que va con la carne normal del plato.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {OPCIONES_CARNE.map((carne) => {
                const activa = carneSeleccionada === carne
                return (
                  <button
                    key={carne}
                    type="button"
                    onClick={() => setCarneSeleccionada(activa ? '' : carne)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
                      activa
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50'
                    }`}
                  >
                    {activa && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                    <span>{carne}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 2. SELECCIÓN RÁPIDA DE SALSAS A UN BOTÓN */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Salsas (Rosada, Piña, Tártara, BBQ, Chimichurri):</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={seleccionarTodasLasSalsas}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border transition active:scale-95 ${
                  tieneTodasLasSalsas
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'bg-slate-950 text-sky-400 border-sky-500/30 hover:bg-sky-500/10'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={seleccionarSinSalsas}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border transition active:scale-95 ${
                  esSinSalsas
                    ? 'bg-rose-500 text-slate-950 border-rose-400'
                    : 'bg-slate-950 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                }`}
              >
                Sin Salsas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {OPCIONES_SALSAS.map((salsa) => {
              const activa = salsasSeleccionadas.includes(salsa)
              return (
                <button
                  key={salsa}
                  type="button"
                  onClick={() => toggleSalsa(salsa)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1 touch-manipulation active:scale-95 ${
                    activa
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {activa && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  <span>{salsa}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. INGREDIENTES A RETIRAR */}
        <div className="mb-5">
          <label className="text-[11px] font-extrabold text-slate-400 block mb-2 uppercase tracking-wider">
            Quitar ingredientes:
          </label>
          <div className="flex flex-wrap gap-2">
            {listaIngredientes.length > 0 ? (
              listaIngredientes.map((ing) => {
                const estaRemovido = ingredientesSin.includes(ing)
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggleIngredienteSin(ing)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 touch-manipulation active:scale-95 ${
                      estaRemovido
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-extrabold line-through'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {estaRemovido ? (
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span>{ing}</span>
                  </button>
                )
              })
            ) : (
              <span className="text-xs text-slate-500 italic font-medium">
                No hay ingredientes asignados a este producto.
              </span>
            )}
          </div>
        </div>

        {/* 4. ADICIONES CON PRECIO Y CANTIDAD */}
        {adicionesDisponibles.length > 0 && (
          <div className="mb-5">
            <label className="text-[11px] font-extrabold text-amber-400 block mb-2 uppercase tracking-wider flex justify-between items-center">
              <span>Adiciones con costo extra:</span>
              {costoAdiciones > 0 && (
                <span className="text-emerald-400 font-extrabold text-xs">
                  +${costoAdiciones.toLocaleString('es-CO')}
                </span>
              )}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adicionesDisponibles.map((adicion) => {
                const itemSeleccionado = adicionesPAGAS.find((a) => a.nombre === adicion.nombre)
                const cantidadActual = itemSeleccionado?.cantidad || 0
                const estaSeleccionada = cantidadActual > 0
                const subtotalAdicion = adicion.precio * (cantidadActual || 1)

                return (
                  <div
                    key={adicion.nombre}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between gap-2 ${
                      estaSeleccionada
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => cambiarCantidadAdicionPaga(adicion, 1)}
                      className="flex-1 flex items-center justify-between gap-1.5 text-left min-w-0 touch-manipulation active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {estaSeleccionada ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shrink-0">
                            {cantidadActual}x
                          </span>
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate">{adicion.nombre}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-extrabold shrink-0 ml-1">
                        +${subtotalAdicion.toLocaleString('es-CO')}
                      </span>
                    </button>

                    {estaSeleccionada && (
                      <div className="flex items-center gap-1 shrink-0 pl-1.5 border-l border-amber-500/30">
                        <button
                          type="button"
                          onClick={() => cambiarCantidadAdicionPaga(adicion, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center justify-center transition active:scale-90 touch-manipulation"
                          title="Quitar 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarCantidadAdicionPaga(adicion, 1)}
                          className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center transition active:scale-90 touch-manipulation"
                          title="Agregar 1 más"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. OBSERVACIÓN LIBRE */}
        <div className="mb-6">
          <label className="text-[11px] font-extrabold text-slate-400 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Nota adicional para cocina:</span>
          </label>
          <textarea
            rows={2}
            value={notasGenerales}
            onChange={(e) => setNotasGenerales(e.target.value)}
            placeholder="Ej: Bien asada, servir bebidas con hielo, salsas aparte..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500 resize-none leading-relaxed placeholder:text-slate-600"
          />
        </div>

        {/* ACCIONES */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setProductoAEditar(null)}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition touch-manipulation active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg touch-manipulation active:scale-95"
          >
            {esNuevoItem
              ? `Agregar a la comanda ($${precioFinalUnitario.toLocaleString('es-CO')})`
              : `Guardar cambios ($${precioFinalUnitario.toLocaleString('es-CO')})`}
          </button>
        </div>
      </div>
    </div>
  )
}
