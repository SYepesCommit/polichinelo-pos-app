import React from 'react'
import { X, FolderPlus, Edit2, Trash2, Check, AlertTriangle, Layers } from 'lucide-react'
import { CategoriasModalProps } from '@/types/producto/producto.types'
import { useCategoriasModal } from '@/hooks/productos/useCategoriasModal'

export const CategoriasModal: React.FC<CategoriasModalProps> = ({
  categorias,
  onClose,
  onCrear,
  onActualizar,
  onEliminar,
}) => {
  const {
    nuevoNombre,
    setNuevoNombre,
    categoriaEditandoId,
    setCategoriaEditandoId,
    nombreEditado,
    setNombreEditado,
    categoriaAEliminar,
    setCategoriaAEliminar,
    procesando,
    handleCrear,
    handleIniciarEditar,
    handleGuardarEdicion,
    handleConfirmarEliminar,
  } = useCategoriasModal({ onCrear, onActualizar, onEliminar })

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Gestión de Categorías
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                Organiza las secciones del menú para la caja y pedidos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULARIO CREAR CATEGORÍA */}
        <form onSubmit={handleCrear} className="flex gap-2 mb-5 shrink-0">
          <input
            type="text"
            required
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nueva categoría (ej: Bebidas, Postres)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={procesando || !nuevoNombre.trim()}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <FolderPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Añadir</span>
          </button>
        </form>

        {/* LISTADO DE CATEGORÍAS */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          {categorias.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              No hay categorías creadas todavía. Crea la primera arriba.
            </div>
          ) : (
            categorias.map((cat) => {
              const esIdEditando = categoriaEditandoId === Number(cat.id)
              const cantidadProductos = cat._count?.productos ?? 0

              return (
                <div
                  key={cat.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  {esIdEditando ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGuardarEdicion(Number(cat.id))
                          if (e.key === 'Escape') setCategoriaEditandoId(null)
                        }}
                        className="flex-1 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleGuardarEdicion(Number(cat.id))}
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl transition active:scale-95"
                        title="Guardar nombre"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoriaEditandoId(null)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition active:scale-95"
                        title="Cancelar edición"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-black text-slate-100 uppercase tracking-wide truncate">
                          {cat.nombre}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full shrink-0">
                          {cantidadProductos} {cantidadProductos === 1 ? 'plato' : 'platos'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleIniciarEditar(cat)}
                          className="p-2 text-slate-400 hover:text-amber-400 bg-slate-900 border border-slate-800 rounded-xl transition active:scale-95"
                          title="Renombrar categoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoriaAEliminar(cat)}
                          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition active:scale-95"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* BOTÓN CERRAR ABAJO */}
        <div className="pt-4 mt-3 border-t border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
          >
            Listo / Volver al Catálogo
          </button>
        </div>

        {/* DIÁLOGO CONFIRMACIÓN ELIMINAR CATEGORÍA */}
        {categoriaAEliminar && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-100 mb-1">
                ¿Eliminar categoría "{categoriaAEliminar.nombre}"?
              </h3>
              <p className="text-xs text-slate-400 mb-5 font-medium leading-relaxed">
                Los productos asignados a esta categoría no se borrarán; pasarán automáticamente a "Sin Categoría".
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={procesando}
                  onClick={() => setCategoriaAEliminar(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesando}
                  onClick={handleConfirmarEliminar}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                >
                  {procesando ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
