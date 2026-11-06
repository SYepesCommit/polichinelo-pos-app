import React from 'react'
import { Sparkles, Utensils, Plus, Archive, Search, X } from 'lucide-react'
import { CategoriasBarProps } from '@/types/pos/categoriasBar.types'

export const CategoriasBar: React.FC<CategoriasBarProps> = ({
  categorias,
  categoriaActiva,
  setCategoriaActiva,
  busquedaPos = '',
  setBusquedaPos,
  onAbrirModalEspeciales,
  onAbrirNuevoEspecial,
  onAbrirArchivados,
}) => {
  const handleSeleccionarCategoria = (id: string) => {
    setCategoriaActiva(id)
    if (setBusquedaPos && busquedaPos) {
      setBusquedaPos('')
    }
  }

  const hayBusquedaActiva = Boolean(busquedaPos.trim())

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-slate-800 mb-4 shrink-0">
      {/* 1. BARRA DE HERRAMIENTAS: Buscador Rápido y Acciones Especiales */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Buscador Rápido de Platos en POS */}
        {setBusquedaPos && (
          <div className="relative w-72 max-w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busquedaPos}
              onChange={(e) => setBusquedaPos(e.target.value)}
              placeholder="Buscar plato o ingrediente..."
              className={`w-full bg-slate-900 border rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none transition ${
                hayBusquedaActiva
                  ? 'border-amber-500 ring-1 ring-amber-500/30'
                  : 'border-slate-800 focus:border-amber-500/60'
              }`}
            />
            {hayBusquedaActiva && (
              <button
                type="button"
                onClick={() => setBusquedaPos('')}
                title="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Grupo de Acciones: Especiales y Archivados */}
        <div className="flex items-center gap-2 ml-auto">
          {onAbrirModalEspeciales && (
            <button
              type="button"
              onClick={onAbrirModalEspeciales}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Configurar platos especiales del catálogo"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestionar Especiales</span>
            </button>
          )}

          {onAbrirNuevoEspecial && (
            <button
              type="button"
              onClick={onAbrirNuevoEspecial}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
              title="Crear un plato especial express para hoy"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Crear Plato del Día</span>
            </button>
          )}

          {onAbrirArchivados && (
            <button
              type="button"
              onClick={onAbrirArchivados}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Ver o borrar platos archivados"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivados</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORÍAS MULTILÍNEA: Visibles al 100% simultáneamente sin scroll lateral */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tab Principal: Plato del Día / Favoritos */}
        <button
          type="button"
          onClick={() => handleSeleccionarCategoria('ESPECIALES_HOY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 active:scale-95 touch-manipulation ${
            !hayBusquedaActiva && categoriaActiva === 'ESPECIALES_HOY'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50'
              : 'bg-slate-900 border border-amber-500/40 text-amber-400 hover:border-amber-500 hover:bg-amber-500/10'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Plato del Día / Favoritos</span>
        </button>

        {/* Lista de Categorías Estándar */}
        {categorias.map((cat) => {
          const catIdStr = String(cat.id)
          const isActiva = !hayBusquedaActiva && categoriaActiva === catIdStr

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSeleccionarCategoria(catIdStr)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 touch-manipulation ${
                isActiva
                  ? 'bg-slate-100 text-slate-950 shadow-lg font-black ring-2 ring-white/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {cat.nombre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
