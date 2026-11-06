import React from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { EspecialesArchivadosModalProps } from '@/types/pos/especialesArchivadosModal.types'
import { useEspecialesArchivados } from '@/hooks/pos/useEspecialesArchivados'


export const EspecialesArchivadosModal: React.FC<EspecialesArchivadosModalProps> = ({
  onClose,
  onRecargarMenu,
}) => {
  const {
    desactivados,
    cargando,
    itemAEliminar,
    setItemAEliminar,
    confirmarEliminacion,
    mensajeError,
    setMensajeError,
  } = useEspecialesArchivados({ onRecargarMenu })

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* BOTÓN DE CIERRE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ENCABEZADO */}
        <div className="flex items-center gap-2 mb-1">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h3 className="text-xl font-extrabold text-slate-100">
            Especiales Archivados / Desactivados
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed">
          Platos especiales fuera de la vista del POS. Puedes borrarlos permanentemente de la base de datos si no tienen ventas registradas.
        </p>

        {/* LISTADO CON SCROLL CONTENIDO */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {cargando && desactivados.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8 font-medium">
              Cargando archivados...
            </p>
          ) : desactivados.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8 font-medium">
              No hay platos especiales desactivados.
            </p>
          ) : (
            desactivados.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{item.nombre}</h4>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    ${item.precioVenta.toLocaleString('es-CO')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setItemAEliminar(item)}
                  disabled={cargando}
                  className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1 touch-manipulation active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar BD</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* PIE DEL MODAL */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition touch-manipulation active:scale-95"
        >
          Cerrar
        </button>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DEFINITIVA */}
        {itemAEliminar && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-2xl p-6 flex flex-col justify-center items-center text-center z-10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              ¿Eliminar definitivamente?
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-[300px] font-medium leading-relaxed">
              Estás a punto de borrar <strong className="text-amber-400">{itemAEliminar.nombre}</strong> de la base de datos. Esta acción no se puede deshacer.
            </p>
            {mensajeError && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold max-w-xs">
                {mensajeError}
              </div>
            )}
            <div className="flex gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setMensajeError(null)
                  setItemAEliminar(null)
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition touch-manipulation active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={cargando}
                className="flex-1 bg-red-500 hover:bg-red-400 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-red-500/20 touch-manipulation active:scale-95 disabled:opacity-50"
              >
                {cargando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}