import React from 'react'
import {
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Power,
  Copy,
  Edit2,
  Trash2,
} from 'lucide-react'
import { ProductoCardProps } from '@/types/producto/producto.types'

const formatearTextoIngredientes = (ingredientes: any) => {
  if (!ingredientes) return null

  if (Array.isArray(ingredientes)) {
    if (ingredientes.length === 0) return null
    return ingredientes
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.ingrediente?.nombre) return item.ingrediente.nombre
        if (item?.nombre) return item.nombre
        return null
      })
      .filter(Boolean)
      .join(', ')
  }

  if (typeof ingredientes === 'string') return ingredientes
  return null
}

export const ProductoCard: React.FC<ProductoCardProps> = ({
  producto: prod,
  formatMoneda,
  onToggleActivo,
  onDuplicar,
  onEditar,
  onEliminar,
}) => {
  const textoIngredientes = formatearTextoIngredientes(prod.ingredientes)

  const costo = prod.costoBase || 0
  const precio = prod.precioVenta || 0
  const margenPct = precio > 0 && costo > 0 ? ((precio - costo) / precio) * 100 : null

  return (
    <div
      className={`p-4 rounded-3xl border transition flex flex-col justify-between gap-3 shadow-md ${
        prod.activo
          ? 'bg-slate-900 border-slate-800/90 hover:border-slate-700'
          : 'bg-slate-950/70 border-slate-900 opacity-60'
      }`}
    >
      <div>
        {/* ÁREA DE IMAGEN Y BADGES */}
        <div className="relative w-full h-32 rounded-2xl bg-slate-950 border border-slate-800/80 mb-3 overflow-hidden flex items-center justify-center">
          {prod.imagenUrl ? (
            <img
              src={
                prod.imagenUrl.startsWith('file://')
                  ? prod.imagenUrl.replace(/\\/g, '/')
                  : prod.imagenUrl
              }
              alt={prod.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-700" />
          )}

          {prod.categoria?.nombre && (
            <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-400 border border-slate-700 backdrop-blur-sm z-10">
              {prod.categoria.nombre}
            </span>
          )}

          {prod.esEspecial && (
            <span className="absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1 shadow z-10">
              <Sparkles className="w-2.5 h-2.5" />
              Especial
            </span>
          )}
        </div>

        {/* NOMBRE, INGREDIENTES Y PRECIO */}
        <h3 className="text-sm font-black text-slate-100 leading-snug line-clamp-1">
          {prod.nombre}
        </h3>

        {textoIngredientes ? (
          <p className="text-[10px] text-slate-400 line-clamp-2 font-medium mt-0.5 leading-tight">
            {textoIngredientes}
          </p>
        ) : (
          <span className="text-[10px] text-slate-600 italic font-medium block mt-0.5">
            Sin ingredientes asignados
          </span>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-amber-400">
            ${formatMoneda(prod.precioVenta)}
          </span>

          {margenPct !== null && (
            <span
              className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded-md flex items-center gap-1"
              title={`Margen: ${margenPct.toFixed(1)}%`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>{margenPct.toFixed(0)}%</span>
            </span>
          )}
        </div>
      </div>

      {/* ACCIONES INFERIORES */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-1">
        <button
          type="button"
          onClick={() => onToggleActivo(prod)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border transition active:scale-95 shadow-sm ${
            prod.activo
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
          }`}
        >
          <Power className="w-3 h-3" />
          <span>{prod.activo ? 'Disponible' : 'Agotado'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicar(prod)}
            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800 rounded-xl transition active:scale-95"
            title="Duplicar / Clonar plato"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEditar(prod)}
            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800 rounded-xl transition active:scale-95"
            title="Editar Producto"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEliminar(prod)}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 rounded-xl transition active:scale-95"
            title="Eliminar Producto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
