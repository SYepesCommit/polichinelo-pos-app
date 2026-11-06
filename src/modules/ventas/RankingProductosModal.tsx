import React, { useState, useMemo } from 'react'
import { Trophy, X, Package, DollarSign, TrendingUp } from 'lucide-react'
import { RankingProductosModalProps } from '@/types/ventas/ventas.types'

type CriterioOrden = 'UNIDADES' | 'DINERO'

export const RankingProductosModal: React.FC<RankingProductosModalProps> = ({
  abierto,
  onCerrar,
  rankingProductos,
  totalUnidadesVendidas,
  formatMoneda,
}) => {
  const [criterio, setCriterio] = useState<CriterioOrden>('UNIDADES')

  const listaOrdenada = useMemo(() => {
    const copia = [...(rankingProductos || [])]
    if (criterio === 'DINERO') {
      return copia.sort(
        (a, b) => b.totalGenerado - a.totalGenerado || b.cantidadVendida - a.cantidadVendida
      )
    }
    return copia.sort(
      (a, b) => b.cantidadVendida - a.cantidadVendida || b.totalGenerado - a.totalGenerado
    )
  }, [rankingProductos, criterio])

  if (!abierto) return null

  const maxValor =
    listaOrdenada.length > 0
      ? criterio === 'UNIDADES'
        ? listaOrdenada[0].cantidadVendida
        : listaOrdenada[0].totalGenerado
      : 1

  const getBadgePosicion = (idx: number) => {
    if (idx === 0) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
          #1
        </span>
      )
    }
    if (idx === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
          #2
        </span>
      )
    }
    if (idx === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-amber-700/80 text-amber-100 font-black text-xs flex items-center justify-center shrink-0">
          #3
        </span>
      )
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-extrabold text-xs flex items-center justify-center shrink-0">
        #{idx + 1}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Ranking de Productos Vendidos
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                Desempeño de platos en el período seleccionado (excluye anulados)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLES DE ORDENAMIENTO TÁCTIL */}
        <div className="flex items-center justify-between gap-2 py-3 border-b border-slate-800/80 shrink-0">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Ordenar por:
          </span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCriterio('UNIDADES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition active:scale-95 ${
                criterio === 'UNIDADES'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Unidades Vendidas</span>
            </button>
            <button
              type="button"
              onClick={() => setCriterio('DINERO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition active:scale-95 ${
                criterio === 'DINERO'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Mayor Ingreso ($)</span>
            </button>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1 custom-scrollbar">
          {listaOrdenada.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-bold">
              No hay productos vendidos registrados en este rango de fechas.
            </div>
          ) : (
            listaOrdenada.map((prod, idx) => {
              const valorActual =
                criterio === 'UNIDADES' ? prod.cantidadVendida : prod.totalGenerado
              const porcentajeBarra = Math.max(
                6,
                Math.min(100, Math.round((valorActual / (maxValor || 1)) * 100))
              )

              return (
                <div
                  key={`${prod.productoId ?? prod.nombre}-${idx}`}
                  className={`p-3.5 rounded-2xl border transition ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {getBadgePosicion(idx)}
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-100 block truncate">
                          {prod.nombre}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {prod.categoriaNombre}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {prod.cantidadVendida} {prod.cantidadVendida === 1 ? 'und' : 'unds'}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          ${formatMoneda(prod.totalGenerado)}
                        </span>
                      </div>
                      {prod.gananciaEstimada > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          Utilidad est.: ${formatMoneda(prod.gananciaEstimada)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO VISUAL */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        idx === 0 ? 'bg-amber-400' : 'bg-emerald-500/70'
                      }`}
                      style={{ width: `${porcentajeBarra}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Platos / Unidades Despachadas
            </span>
            <span className="text-base font-black text-amber-400">
              {totalUnidadesVendidas} unidades ({listaOrdenada.length} referencias distintas)
            </span>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-extrabold transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
