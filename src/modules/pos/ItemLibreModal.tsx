import React from 'react'
import { X, PlusCircle } from 'lucide-react'
import { ItemLibreModalProps } from '@/types/pos/comandaPanel.types'

export const ItemLibreModal: React.FC<ItemLibreModalProps> = ({
  nombreItemLibre,
  setNombreItemLibre,
  precioItemLibre,
  setPrecioItemLibre,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-extrabold text-slate-100 mb-1 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Agregar Ítem Libre</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Agrega un valor o concepto personalizado a la comanda actual.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider">
              Concepto / Descripción:
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nombreItemLibre}
              onChange={(e) => setNombreItemLibre(e.target.value)}
              placeholder="Ej: Empaque especial, Recargo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-400 block mb-1 uppercase tracking-wider">
              Precio ($):
            </label>
            <input
              type="number"
              required
              min="500"
              step="500"
              value={precioItemLibre}
              onChange={(e) => setPrecioItemLibre(e.target.value)}
              placeholder="Ej: 2000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition touch-manipulation active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-md touch-manipulation active:scale-95"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
