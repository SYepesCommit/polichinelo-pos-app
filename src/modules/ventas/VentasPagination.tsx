import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VentasPaginationProps } from '@/types/ventas/ventas.types'


export const VentasPagination: React.FC<VentasPaginationProps> = ({
  cantidadMostrando, totalRegistros, paginaActual, totalPaginas, cargando, setPaginaActual
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 pt-4 mt-3">
      <span className="text-xs text-slate-400 font-medium">
        Mostrando <strong className="text-slate-200">{cantidadMostrando}</strong> de <strong className="text-amber-400">{totalRegistros}</strong> pedidos
      </span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={paginaActual <= 1 || cargando} onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95"><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <span className="text-xs font-black text-slate-400 px-3">Página {paginaActual} de {totalPaginas}</span>
        <button type="button" disabled={paginaActual >= totalPaginas || cargando} onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95">Siguiente <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}