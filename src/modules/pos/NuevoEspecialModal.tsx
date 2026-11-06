import React from 'react'
import { X, Sparkles, PlusCircle } from 'lucide-react'
import { NuevoEspecialModalProps } from '@/types/pos/nuevoEspecialModal.types'
import { useNuevoEspecial } from '@/hooks/pos/useNuevoEspecial'

export const NuevoEspecialModal: React.FC<NuevoEspecialModalProps> = (props) => {
  const { onClose, categorias } = props
  const {
    nombre,
    setNombre,
    precio,
    setPrecio,
    categoriaId,
    setCategoriaId,
    ingredienteInput,
    setIngredienteInput,
    ingredientes,
    guardando,
    handleAddIngrediente,
    handleRemoveIngrediente,
    handleSubmit,
  } = useNuevoEspecial(props)

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* BOTÓN CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ENCABEZADO */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-extrabold text-slate-100">Nuevo Especial del Día</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
          Registra un plato especial que estará activo inmediatamente en el menú y en los reportes.
        </p>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del plato *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Sancocho Trifásico Especial"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Precio ($) *</label>
              <input
                type="number"
                required
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="22000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Categoría *</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GESTIÓN DE INGREDIENTES / ACOMPAÑAMIENTOS */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Ingredientes / Acompañamientos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredienteInput}
                onChange={(e) => setIngredienteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddIngrediente()
                  }
                }}
                placeholder="Ej: Sopa de Verduras, Arroz, Aguacate"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddIngrediente}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition touch-manipulation active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {ingredientes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ingredientes.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngrediente(idx)}
                      className="hover:text-red-400 p-0.5 rounded transition touch-manipulation"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ACCIONES */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition touch-manipulation active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-amber-500/20 touch-manipulation active:scale-95 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Crear y Activar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}