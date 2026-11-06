import React from 'react'
import { Building2, Plus, Trash2, X, AlertTriangle } from 'lucide-react'
import { useGestionBancos } from '@/hooks/pos/useGestionBancos'
import { BancoModalProps } from '@/types/pos/bancoModal.types'



export const BancoModal: React.FC<BancoModalProps> = ({
  bancos,
  onClose,
  onBancoAgregado,
}) => {
  const {
    nuevoNombre,
    setNuevoNombre,
    bancoAEliminar,
    setBancoAEliminar,
    cargando,
    errorMsg,
    handleCrear,
    confirmarEliminacion,
  } = useGestionBancos({ onBancoAgregado })

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
            <Building2 className="w-5 h-5" />
            <span>Gestión de Bancos</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition touch-manipulation active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje de Error si aplica */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Formulario para agregar */}
        <form onSubmit={handleCrear} className="flex gap-2 my-4">
          <input
            type="text"
            placeholder="Ej: Davivienda, Nu, Lulo..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            disabled={cargando}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!nuevoNombre.trim() || cargando}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 transition touch-manipulation active:scale-95 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Agregar</span>
          </button>
        </form>

        {/* Lista de Bancos */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {bancos.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 font-medium">
              No hay bancos registrados en la base de datos.
            </p>
          ) : (
            bancos.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
              >
                <span className="text-xs font-bold text-slate-200">{b.nombre}</span>
                <button
                  type="button"
                  onClick={() => setBancoAEliminar(b)}
                  disabled={cargando}
                  className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition touch-manipulation active:scale-95"
                  title="Eliminar Banco"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* DIÁLOGO PERSONALIZADO DE CONFIRMACIÓN */}
        {bancoAEliminar && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-2xl p-6 flex flex-col justify-center items-center text-center z-10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-100 mb-1">
              ¿Eliminar banco?
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-[260px] font-medium leading-relaxed">
              Estás a punto de borrar <strong className="text-amber-400">{bancoAEliminar.nombre}</strong> de la base de datos.
            </p>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setBancoAEliminar(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition touch-manipulation active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={cargando}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-rose-500/20 touch-manipulation active:scale-95"
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