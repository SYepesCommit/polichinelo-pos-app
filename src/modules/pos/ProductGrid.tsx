import React from 'react'
import { Plus, Sparkles, UtensilsCrossed, Pencil, Image as ImageIcon } from 'lucide-react'
import { ProductGridProps } from '@/types/pos/comandaPanel.types'

export const ProductGrid: React.FC<ProductGridProps> = ({
  productos,
  categoriaActiva,
  onAgregarRapido,
  onAbrirPersonalizacion,
  onAbrirNuevoEspecial,
}) => {
  const esVistaEspeciales = categoriaActiva === 'ESPECIALES_HOY'

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Tarjeta para crear nuevo especial express cuando se está en la pestaña Plato del Día */}
        {esVistaEspeciales && onAbrirNuevoEspecial && (
          <button
            type="button"
            onClick={onAbrirNuevoEspecial}
            className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-amber-400 transition cursor-pointer min-h-[220px] group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition">
              <Plus className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-center">
              + Crear Plato del Día
            </span>
          </button>
        )}

        {/* Tarjetas de Productos */}
        {productos.map((producto) => (
          <div
            key={producto.id}
            className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between min-h-[240px] ${
              producto.esEspecial
                ? 'bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {producto.esEspecial && (
              <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 z-20 shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                Especial
              </span>
            )}

            <div className="space-y-2.5">
              {/* 📸 ÁREA DE LA IMAGEN DEL PRODUCTO */}
              <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative group shrink-0">
                {producto.imagenUrl ? (
                  <img
                    src={
                      producto.imagenUrl.startsWith('file://')
                        ? producto.imagenUrl.replace(/\\/g, '/')
                        : producto.imagenUrl
                    }
                    alt={producto.nombre}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 relative z-10 bg-slate-950"
                    onError={(e) => {
                      // Oculta la etiqueta si falla para evitar mostrar alt roto
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  /* Ícono y texto cuando NO hay imagen registrada */
                  <div className="flex flex-col items-center justify-center text-slate-700 gap-1 pointer-events-none">
                    <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                      Sin foto
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-slate-100 line-clamp-1 leading-snug">
                  {producto.nombre}
                </h4>
                {producto.descripcion && (
                  <p className="text-[10px] text-slate-400 line-clamp-1 font-medium mt-0.5">
                    {producto.descripcion}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-amber-400">
                  ${producto.precio.toLocaleString('es-CO')}
                </span>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="grid grid-cols-2 gap-1.5">
                {/* Botón 1: Agregar rápido a la comanda */}
                <button
                  type="button"
                  onClick={() => onAgregarRapido(producto)}
                  className="py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Agregar</span>
                </button>

                {/* Botón 2: Personalizar adiciones / notas */}
                <button
                  type="button"
                  onClick={() => onAbrirPersonalizacion(producto)}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border border-slate-700 hover:text-amber-400 hover:border-amber-500/40 active:scale-95"
                  title="Añadir adiciones u observaciones"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Personalizar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vacío */}
      {productos.length === 0 && !esVistaEspeciales && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <UtensilsCrossed className="w-10 h-10 mb-2 stroke-[1.5]" />
          <p className="text-xs font-semibold">No hay productos disponibles en esta categoría</p>
        </div>
      )}
    </div>
  )
}