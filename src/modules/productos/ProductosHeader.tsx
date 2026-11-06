import React from 'react'
import { Package, RotateCcw, Layers, Plus } from 'lucide-react'
import { ProductosHeaderProps } from '@/types/producto/producto.types'

export const ProductosHeader: React.FC<ProductosHeaderProps> = ({
  cargando,
  onRecargar,
  onAbrirCategorias,
  onAbrirNuevo,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Package className="w-6 h-6 text-amber-400" />
          <span>Catálogo de Productos</span>
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Gestión táctil de menú, precios, categorías y disponibilidad en caja
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onRecargar}
          disabled={cargando}
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition active:scale-95 disabled:opacity-50"
          title="Actualizar catálogo"
        >
          <RotateCcw className={`w-4 h-4 ${cargando ? 'animate-spin text-amber-400' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onAbrirCategorias}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-bold text-xs transition active:scale-95"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Categorías</span>
        </button>

        <button
          type="button"
          onClick={onAbrirNuevo}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Producto</span>
        </button>
      </div>
    </div>
  )
}
