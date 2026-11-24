import React from 'react'
import { Package, AlertTriangle } from 'lucide-react'
import { useProductos } from '@/hooks/productos/useProductos'
import { ProductoModal } from './ProductoModal'
import { CategoriasModal } from './CategoriasModal'
import { ProductosHeader } from './ProductosHeader'
import { ProductosKpis } from './ProductosKpis'
import { ProductosFilters } from './ProductosFilters'
import { ProductoCard } from './ProductoCard'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Producto } from '@/types/producto/producto.types'

export const ProductosView: React.FC = () => {
  const {
    productosFiltrados,
    categorias,
    cargando,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    filtroEstado,
    setFiltroEstado,
    kpis,
    productoAEliminar,
    setProductoAEliminar,
    modalAbierto,
    setModalAbierto,
    modalCategoriasAbierto,
    setModalCategoriasAbierto,
    productoEditar,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleDuplicarProducto,
    handleToggleActivo,
    handleGuardarProducto,
    handleConfirmarEliminar,
    handleCrearCategoria,
    handleActualizarCategoria,
    handleEliminarCategoria,
    recargar,
  } = useProductos()

  const formatMoneda = (monto: number) => monto.toLocaleString('es-CO')

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-full flex flex-col select-none">
      <ProductosHeader
        cargando={cargando}
        onRecargar={recargar}
        onAbrirCategorias={() => setModalCategoriasAbierto(true)}
        onAbrirNuevo={handleAbrirNuevo}
      />

      <ProductosKpis
        kpis={kpis}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
      />

      <ProductosFilters
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        setCategoriaSeleccionada={setCategoriaSeleccionada}
      />

      {/* GRID DE PRODUCTOS */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative">
        {cargando ? (
          <LoadingScreen mensaje="Cargando productos del catálogo..." />
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800/80 rounded-3xl">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-40" />
            <p className="text-xs text-slate-400 font-bold">
              No se encontraron productos coincidentes con los filtros seleccionados.
            </p>
            {(busqueda || filtroEstado !== 'TODOS' || categoriaSeleccionada !== 'TODAS') && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('')
                  setFiltroEstado('TODOS')
                  setCategoriaSeleccionada('TODAS')
                }}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((prod: Producto) => (
              <ProductoCard
                key={prod.id}
                producto={prod}
                formatMoneda={formatMoneda}
                onToggleActivo={handleToggleActivo}
                onDuplicar={handleDuplicarProducto}
                onEditar={handleAbrirEditar}
                onEliminar={setProductoAEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalAbierto && (
        <ProductoModal
          productoEditar={productoEditar}
          categorias={categorias}
          onClose={() => setModalAbierto(false)}
          onGuardar={handleGuardarProducto}
        />
      )}

      {/* MODAL GESTIONAR CATEGORÍAS */}
      {modalCategoriasAbierto && (
        <CategoriasModal
          categorias={categorias}
          onClose={() => setModalCategoriasAbierto(false)}
          onCrear={handleCrearCategoria}
          onActualizar={handleActualizarCategoria}
          onEliminar={handleEliminarCategoria}
        />
      )}

      {/* DIÁLOGO CONFIRMACIÓN ELIMINACIÓN DEFINITIVA */}
      {productoAEliminar && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              ¿Eliminar definitivamente &quot;{productoAEliminar.nombre}&quot;?
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
              Este producto se borrará por completo de tu catálogo. Las ventas pasadas conservarán su nombre y valor en el historial contable.
            </p>

            {productoAEliminar.activo && (
              <button
                type="button"
                onClick={() => {
                  handleToggleActivo(productoAEliminar)
                  setProductoAEliminar(null)
                }}
                className="w-full mb-2.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 rounded-xl text-xs font-extrabold transition active:scale-95"
              >
                Solo Desactivar (ocultar de caja sin borrar)
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProductoAEliminar(null)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
