import React from 'react'
import { Search, CheckCircle2, XCircle, Building2, X } from 'lucide-react'
import { VentasFiltersProps } from '@/types/ventas/ventas.types'

export const VentasFilters: React.FC<VentasFiltersProps> = ({
  busqueda,
  setBusqueda,
  filtroEstadoVenta,
  setFiltroEstadoVenta,
  tipoPedidoFiltro,
  setTipoPedidoFiltro,
  bancoFiltro,
  nombreBancoFiltro,
  onLimpiarBancoFiltro,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-5">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por # consecutivo, cliente o teléfono celular..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {bancoFiltro && bancoFiltro !== 'TODOS' && (
        <button
          type="button"
          onClick={onLimpiarBancoFiltro}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-extrabold shrink-0 hover:bg-purple-500/30 transition active:scale-95"
          title="Quitar filtro de entidad bancaria"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Banco: {nombreBancoFiltro || bancoFiltro}</span>
          <X className="w-3.5 h-3.5 ml-1" />
        </button>
      )}

      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => setFiltroEstadoVenta('TODOS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
            filtroEstadoVenta === 'TODOS'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TODOS
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstadoVenta('REALIZADOS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 flex items-center gap-1 ${
            filtroEstadoVenta === 'REALIZADOS'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVAS
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstadoVenta('ANULADOS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 flex items-center gap-1 ${
            filtroEstadoVenta === 'ANULADOS'
              ? 'bg-rose-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" /> ANULADAS
        </button>
      </div>

      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
        {['TODOS', 'MESA', 'LLEVAR', 'DOMICILIO'].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoPedidoFiltro(tipo)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
              tipoPedidoFiltro === tipo
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>
    </div>
  )
}
