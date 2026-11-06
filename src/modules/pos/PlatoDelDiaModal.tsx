import React from 'react'
import { X, Sparkles, Search, EyeOff } from 'lucide-react'
import { PlatoDelDiaModalProps } from '@/types/pos/platoDelDiaModal.types'
import { usePlatoDelDia } from '@/hooks/pos/usePlatoDelDia'

export const PlatoDelDiaModal: React.FC<PlatoDelDiaModalProps> = ({
  categorias,
  onClose,
  onToggleEspecial,
  onDesactivarProducto,
}) => {
  const { busqueda, setBusqueda, productosFiltrados } = usePlatoDelDia({ categorias })

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABECERA */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-extrabold text-slate-100">Gestionar Especiales</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
          Selecciona qué platos destacan como Plato del Día o desactívalos si deseas archivarlos.
        </p>

        {/* BUSCADOR */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar plato..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* LISTA DE PRODUCTOS CON SCROLL CONTENIDO */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {productosFiltrados.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8 font-medium">
              No se encontraron platos que coincidan con la búsqueda.
            </p>
          ) : (
            productosFiltrados.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{p.nombre}</h4>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    ${p.precio.toLocaleString('es-CO')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* BOTÓN OPCIONAL DE DESACTIVAR / ARCHIVAR */}
                  {onDesactivarProducto && (
                    <button
                      type="button"
                      onClick={() => onDesactivarProducto(String(p.id))}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 touch-manipulation active:scale-95"
                      title="Archivar o desactivar plato"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Desactivar</span>
                    </button>
                  )}

                  {/* BOTÓN CONMUTAR ESPECIAL (PLATO DEL DÍA) */}
                  <button
                    type="button"
                    onClick={() => onToggleEspecial(String(p.id), !p.esEspecial)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border touch-manipulation active:scale-95 ${
                      p.esEspecial
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{p.esEspecial ? 'Especial Activo' : 'Marcar Especial'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ACCIÓN DE CIERRE */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-amber-500/20 touch-manipulation active:scale-95"
        >
          Guardar y Cerrar
        </button>
      </div>
    </div>
  )
}