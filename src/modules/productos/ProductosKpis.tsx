import React from 'react'
import { Package, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { ProductosKpisProps } from '@/types/producto/producto.types'

export const ProductosKpis: React.FC<ProductosKpisProps> = ({
  kpis,
  filtroEstado,
  setFiltroEstado,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
      <button
        type="button"
        onClick={() => setFiltroEstado('TODOS')}
        className={`p-3 rounded-2xl border text-left transition active:scale-95 flex items-center justify-between ${
          filtroEstado === 'TODOS'
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
        }`}
      >
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block">Total Menú</span>
          <span className="text-xl font-black text-slate-100">{kpis.total}</span>
        </div>
        <Package className="w-5 h-5 opacity-60 text-amber-400" />
      </button>

      <button
        type="button"
        onClick={() => setFiltroEstado('DISPONIBLES')}
        className={`p-3 rounded-2xl border text-left transition active:scale-95 flex items-center justify-between ${
          filtroEstado === 'DISPONIBLES'
            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
        }`}
      >
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block">Disponibles</span>
          <span className="text-xl font-black text-emerald-400">{kpis.disponibles}</span>
        </div>
        <CheckCircle2 className="w-5 h-5 opacity-60 text-emerald-400" />
      </button>

      <button
        type="button"
        onClick={() => setFiltroEstado('AGOTADOS')}
        className={`p-3 rounded-2xl border text-left transition active:scale-95 flex items-center justify-between ${
          filtroEstado === 'AGOTADOS'
            ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
        }`}
      >
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block">Agotados</span>
          <span className="text-xl font-black text-rose-400">{kpis.agotados}</span>
        </div>
        <XCircle className="w-5 h-5 opacity-60 text-rose-400" />
      </button>

      <button
        type="button"
        onClick={() => setFiltroEstado('ESPECIALES')}
        className={`p-3 rounded-2xl border text-left transition active:scale-95 flex items-center justify-between ${
          filtroEstado === 'ESPECIALES'
            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
        }`}
      >
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider block">Platos del Día</span>
          <span className="text-xl font-black text-amber-400">{kpis.especiales}</span>
        </div>
        <Sparkles className="w-5 h-5 opacity-60 text-amber-400" />
      </button>
    </div>
  )
}
