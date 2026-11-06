import React from 'react'
import { X, Package, Sparkles, FolderOpen, Image as ImageIcon, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { useProductoModal } from '@/hooks/productos/useProductoModal'
import { ProductoModalProps } from '@/types/producto/producto.types'
import { IngredientesTagInput } from './IngredientesTagInput'

export const ProductoModal: React.FC<ProductoModalProps> = ({
  productoEditar,
  categorias,
  onClose,
  onGuardar,
}) => {
  const {
    nombre,
    setNombre,
    ingredientes,
    agregarIngrediente,
    removerIngrediente,
    precioVenta,
    setPrecioVenta,
    costoBase,
    setCostoBase,
    categoriaId,
    setCategoriaId,
    imagenUrl,
    esEspecial,
    setEsEspecial,
    activo,
    setActivo,
    guardando,
    pv,
    ganancia,
    margenPct,
    esPerdida,
    handleSeleccionarImagen,
    handleLimpiarImagen,
    handleSubmit,
  } = useProductoModal({ productoEditar, categorias, onGuardar, onClose })

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">
                {productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {productoEditar
                  ? 'Modifica los datos del elemento seleccionado'
                  : 'Añade un nuevo ítem al menú de caja'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Hamburguesa Especial..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* INGREDIENTES CON TAG INPUT INTERACTIVO */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Ingredientes y Componentes</span>
            </label>
            <IngredientesTagInput
              ingredientes={ingredientes}
              onAgregar={agregarIngrediente}
              onRemover={removerIngrediente}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Precio Venta ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                placeholder="25000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Costo Base ($)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={costoBase}
                onChange={(e) => setCostoBase(e.target.value)}
                placeholder="10000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* CÁLCULO EN TIEMPO REAL DE MARGEN Y RENTABILIDAD */}
          {pv > 0 && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                esPerdida
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    esPerdida ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {esPerdida ? (
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <span className="font-extrabold block text-xs">
                    {esPerdida ? '¡Alerta: Venta sin ganancia o a pérdida!' : 'Ganancia Bruta Estimada'}
                  </span>
                  <span className="text-[11px] font-medium opacity-80">
                    ${ganancia.toLocaleString('es-CO')} COP por unidad
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block font-black text-xs px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                    esPerdida
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  Margen: {margenPct.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">Sin Categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Imagen del Producto
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
                <div className="relative w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {imagenUrl ? (
                    <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSeleccionarImagen}
                  className="flex-1 py-1.5 px-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-lg text-[11px] font-bold text-slate-300 hover:text-amber-400 transition flex items-center justify-center gap-1.5 active:scale-95 truncate"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{imagenUrl ? 'Cambiar' : 'Examinar...'}</span>
                </button>

                {imagenUrl && (
                  <button
                    type="button"
                    onClick={handleLimpiarImagen}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-800/50 text-slate-400 hover:text-rose-400 rounded-lg transition active:scale-95 shrink-0"
                    title="Quitar imagen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OPCIONES SECUNDARIAS */}
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esEspecial}
                onChange={(e) => setEsEspecial(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Producto Especial / Destacado
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">Disponible en Caja</span>
            </label>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : productoEditar ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
