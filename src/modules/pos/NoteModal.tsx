import React from 'react'
import { X, Plus, Minus, FileText, Check } from 'lucide-react'
import { NoteModalProps } from '@/types/pos/noteModal.types'
import { useNoteModal } from '@/hooks/pos/useNoteModal'


export const NoteModal: React.FC<NoteModalProps> = ({
  productoAEditar,
  setProductoAEditar,
  adicionesDisponibles = [],
  onGuardarObservacion,
  esNuevoItem = false,
}) => {
  const {
    ingredientesSin,
    adicionesPAGAS,
    notasGenerales,
    costoAdiciones,
    precioFinalUnitario,
    listaIngredientes,
    setNotasGenerales,
    toggleIngredienteSin,
    toggleAdicionPaga,
    handleGuardar,
  } = useNoteModal({
    productoAEditar,
    adicionesDisponibles,
    onGuardarObservacion,
    setProductoAEditar,
  })

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
        <h3 className="text-xl font-extrabold text-slate-100 mb-1">
          Personalizar: <span className="text-amber-400">{productoAEditar.producto.nombre}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5 font-medium leading-relaxed">
          Selecciona qué ingredientes quitar, añadir o escribe una observación libre.
        </p>

        {/* 1. INGREDIENTES A RETIRAR */}
        <div className="mb-5">
          <label className="text-[11px] font-extrabold text-slate-400 block mb-2 uppercase tracking-wider">
            1. Quitar ingredientes:
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

        {/* 2. ADICIONES CON PRECIO */}
        {adicionesDisponibles.length > 0 && (
          <div className="mb-5">
            <label className="text-[11px] font-extrabold text-amber-400 block mb-2 uppercase tracking-wider flex justify-between items-center">
              <span>2. Adiciones con costo extra:</span>
              {costoAdiciones > 0 && (
                <span className="text-emerald-400 font-extrabold text-xs">
                  +${costoAdiciones.toLocaleString('es-CO')}
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {adicionesDisponibles.map((adicion) => {
                const estaSeleccionada = adicionesPAGAS.some((a) => a.nombre === adicion.nombre)
                return (
                  <button
                    key={adicion.nombre}
                    type="button"
                    onClick={() => toggleAdicionPaga(adicion)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between touch-manipulation active:scale-95 ${
                      estaSeleccionada
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {estaSeleccionada ? (
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className="truncate">{adicion.nombre}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-extrabold shrink-0 ml-1">
                      +${adicion.precio.toLocaleString('es-CO')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. OBSERVACIÓN LIBRE */}
        <div className="mb-6">
          <label className="text-[11px] font-extrabold text-slate-400 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Nota adicional para cocina:</span>
          </label>
          <textarea
            rows={3}
            value={notasGenerales}
            onChange={(e) => setNotasGenerales(e.target.value)}
            placeholder="Ej: Bien asada, servir bebidas con hielo, salsa de ajo por separado..."
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