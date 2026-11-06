import React from 'react'
import { Search } from 'lucide-react'
import { ProductosFiltersProps } from '@/types/producto/producto.types'

export const ProductosFilters: React.FC<ProductosFiltersProps> = ({
  busqueda,
  setBusqueda,
  categorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-5">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o ingrediente (ej: Cheddar, Tocineta)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {/* SELECTOR DE CATEGORÍAS */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto custom-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setCategoriaSeleccionada('TODAS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition active:scale-95 ${
            categoriaSeleccionada === 'TODAS'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          TODAS
        </button>

        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoriaSeleccionada(Number(cat.id))}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition active:scale-95 ${
              categoriaSeleccionada === cat.id
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.nombre.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
