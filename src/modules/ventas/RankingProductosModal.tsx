import React, { useState, useMemo } from 'react'
import {
  Trophy,
  X,
  Package,
  DollarSign,
  TrendingUp,
  CupSoda,
  UtensilsCrossed,
  Layers,
} from 'lucide-react'
import { RankingProductosModalProps } from '@/types/ventas/ventas.types'

type CriterioOrden = 'UNIDADES' | 'DINERO'
type FiltroVista = 'TODOS' | 'PLATOS' | 'BEBIDAS' | string

export const RankingProductosModal: React.FC<RankingProductosModalProps> = ({
  abierto,
  onCerrar,
  rankingProductos,
  totalUnidadesVendidas,
  formatMoneda,
}) => {
  const [criterio, setCriterio] = useState<CriterioOrden>('UNIDADES')
  const [filtroVista, setFiltroVista] = useState<FiltroVista>('TODOS')

  const categoriasDisponibles = useMemo(() => {
    const mapa = new Map<string, { nombre: string; unidades: number; esBebida: boolean }>()
    ;(rankingProductos || []).forEach((p) => {
      const cat = p.categoriaNombre || 'Varios'
      const actual = mapa.get(cat)
      if (actual) {
        actual.unidades += p.cantidadVendida
        if (p.esBebida) actual.esBebida = true
      } else {
        mapa.set(cat, {
          nombre: cat,
          unidades: p.cantidadVendida,
          esBebida: Boolean(p.esBebida),
        })
      }
    })
    return Array.from(mapa.values()).sort((a, b) => b.unidades - a.unidades)
  }, [rankingProductos])

  const resumenPlatosYBebidas = useMemo(() => {
    let platosUnds = 0
    let platosMonto = 0
    let bebidasUnds = 0
    let bebidasMonto = 0

    ;(rankingProductos || []).forEach((p) => {
      if (p.esBebida) {
        bebidasUnds += p.cantidadVendida
        bebidasMonto += p.totalGenerado
      } else {
        platosUnds += p.cantidadVendida
        platosMonto += p.totalGenerado
      }
    })

    return { platosUnds, platosMonto, bebidasUnds, bebidasMonto }
  }, [rankingProductos])

  const listaOrdenada = useMemo(() => {
    const filtrada = (rankingProductos || []).filter((p) => {
      if (filtroVista === 'TODOS') return true
      if (filtroVista === 'PLATOS') return !p.esBebida
      if (filtroVista === 'BEBIDAS') return Boolean(p.esBebida)
      return p.categoriaNombre === filtroVista
    })

    if (criterio === 'DINERO') {
      return filtrada.sort(
        (a, b) => b.totalGenerado - a.totalGenerado || b.cantidadVendida - a.cantidadVendida
      )
    }
    return filtrada.sort(
      (a, b) => b.cantidadVendida - a.cantidadVendida || b.totalGenerado - a.totalGenerado
    )
  }, [rankingProductos, criterio, filtroVista])

  const totalesVistaActual = useMemo(() => {
    return listaOrdenada.reduce(
      (acc, p) => {
        acc.unidades += p.cantidadVendida
        acc.monto += p.totalGenerado
        acc.utilidad += p.gananciaEstimada || 0
        return acc
      },
      { unidades: 0, monto: 0, utilidad: 0 }
    )
  }, [listaOrdenada])

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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Ranking de Productos y Cuadre de Bebidas
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                Filtra por Platos, Bebidas o Categoría para cuadrar inventario y nevera
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

        {/* FILTROS TÁCTILES RÁPIDOS (TODOS / PLATOS / BEBIDAS / CATEGORÍAS) */}
        <div className="flex flex-col gap-2.5 py-3 border-b border-slate-800/80 shrink-0">
          {/* Fila 1: Resumen rápido Platos vs Bebidas */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFiltroVista('TODOS')}
              className={`p-2.5 rounded-xl border text-left transition active:scale-[0.98] ${
                filtroVista === 'TODOS'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-slate-400">
                <Layers className="w-3 h-3 text-amber-400" /> Todo el Menú
              </span>
              <div className="text-xs font-black text-slate-100 mt-0.5">
                {totalUnidadesVendidas} unds
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFiltroVista('PLATOS')}
              className={`p-2.5 rounded-xl border text-left transition active:scale-[0.98] ${
                filtroVista === 'PLATOS'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-emerald-400">
                <UtensilsCrossed className="w-3 h-3" /> Solo Platos / Comida
              </span>
              <div className="text-xs font-black text-slate-100 mt-0.5">
                {resumenPlatosYBebidas.platosUnds} unds · $
                {formatMoneda(resumenPlatosYBebidas.platosMonto)}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFiltroVista('BEBIDAS')}
              className={`p-2.5 rounded-xl border text-left transition active:scale-[0.98] ${
                filtroVista === 'BEBIDAS'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 text-cyan-400">
                <CupSoda className="w-3 h-3" /> Solo Bebidas / Nevera
              </span>
              <div className="text-xs font-black text-slate-100 mt-0.5">
                {resumenPlatosYBebidas.bebidasUnds} unds · $
                {formatMoneda(resumenPlatosYBebidas.bebidasMonto)}
              </div>
            </button>
          </div>

          {/* Fila 2: Chips por Categoría + Ordenamiento */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {categoriasDisponibles.map((cat) => {
                const activa = filtroVista === cat.nombre
                return (
                  <button
                    key={cat.nombre}
                    type="button"
                    onClick={() =>
                      setFiltroVista(activa ? 'TODOS' : cat.nombre)
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition active:scale-95 ${
                      activa
                        ? cat.esBebida
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                          : 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat.esBebida ? '🥤 ' : ''}
                    {cat.nombre} ({cat.unidades})
                  </button>
                )
              })}
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => setCriterio('UNIDADES')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition active:scale-95 ${
                  criterio === 'UNIDADES'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>Unidades</span>
              </button>
              <button
                type="button"
                onClick={() => setCriterio('DINERO')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition active:scale-95 ${
                  criterio === 'DINERO'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>Ingreso ($)</span>
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1 custom-scrollbar">
          {listaOrdenada.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-bold">
              {filtroVista === 'BEBIDAS'
                ? 'No hay bebidas ni gaseosas vendidas registradas en este período.'
                : 'No hay productos vendidos registrados para este filtro.'}
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
                      ? prod.esBebida
                        ? 'bg-cyan-500/10 border-cyan-500/40'
                        : 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {getBadgePosicion(idx)}
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-100 block truncate">
                          {prod.esBebida ? '🥤 ' : ''}
                          {prod.nombre}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            prod.esBebida ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        >
                          {prod.categoriaNombre}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                            prod.esBebida
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
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
                        prod.esBebida
                          ? 'bg-cyan-400'
                          : idx === 0
                          ? 'bg-amber-400'
                          : 'bg-emerald-500/70'
                      }`}
                      style={{ width: `${porcentajeBarra}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* PIE DEL MODAL CON SUBTOTAL DEL FILTRO SELECCIONADO */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center gap-3 shrink-0 flex-wrap">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {filtroVista === 'TODOS'
                ? 'Total Despachado (Platos + Bebidas)'
                : filtroVista === 'BEBIDAS'
                ? 'Total Bebidas / Gaseosas Despachadas (Cuadre Nevera)'
                : filtroVista === 'PLATOS'
                ? 'Total Platos / Comida Despachada'
                : `Total Categoría: ${filtroVista}`}
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-base font-black text-amber-400">
                {totalesVistaActual.unidades} unidades
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-base font-black text-emerald-400">
                ${formatMoneda(totalesVistaActual.monto)}
              </span>
              {totalesVistaActual.utilidad > 0 && (
                <span className="text-xs font-bold text-slate-400">
                  (Utilidad est.: ${formatMoneda(totalesVistaActual.utilidad)})
                </span>
              )}
            </div>
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
