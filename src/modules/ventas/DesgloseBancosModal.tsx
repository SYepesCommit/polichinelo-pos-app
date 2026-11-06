import React from 'react'
import { Building2, X, Filter, Check } from 'lucide-react'
import { DesgloseBancosModalProps } from '@/types/ventas/ventas.types'

export const DesgloseBancosModal: React.FC<DesgloseBancosModalProps> = ({
  abierto,
  onCerrar,
  desgloseBancos,
  totalBancos,
  bancoFiltroActual,
  onSeleccionarBancoFiltro,
  formatMoneda,
}) => {
  if (!abierto) return null

  const maxMonto =
    desgloseBancos.length > 0 ? desgloseBancos[0].totalMonto : 1

  const handleSeleccionar = (bancoId: string) => {
    onSeleccionarBancoFiltro(bancoId)
    onCerrar()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Desglose por Banco / Entidad
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                Toca una entidad para filtrar sus pedidos en la lista
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LISTADO DE ENTIDADES */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1 custom-scrollbar">
          {desgloseBancos.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 font-bold">
              No hay ingresos por bancos o transferencias en este período.
            </div>
          ) : (
            desgloseBancos.map((b) => {
              const esFiltrado = bancoFiltroActual === b.bancoId
              const porcentaje = Math.max(
                6,
                Math.min(100, Math.round((b.totalMonto / (maxMonto || 1)) * 100))
              )

              return (
                <button
                  key={b.bancoId}
                  type="button"
                  onClick={() =>
                    handleSeleccionar(esFiltrado ? 'TODOS' : b.bancoId)
                  }
                  className={`w-full text-left p-3.5 rounded-2xl border transition active:scale-[0.99] ${
                    esFiltrado
                      ? 'bg-purple-500/15 border-purple-500/60 ring-1 ring-purple-500/30'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-black text-slate-100 truncate">
                        {b.nombre}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                        {b.cantidadPedidos}{' '}
                        {b.cantidadPedidos === 1 ? 'pago' : 'pagos'}
                      </span>
                      {esFiltrado && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg">
                          <Check className="w-3 h-3" /> Filtrando
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-black text-purple-300">
                        ${formatMoneda(b.totalMonto)}
                      </span>
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Bancos y Transferencias
            </span>
            <span className="text-lg font-black text-purple-300">
              ${formatMoneda(totalBancos)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bancoFiltroActual !== 'TODOS' && (
              <button
                type="button"
                onClick={() => handleSeleccionar('TODOS')}
                className="px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-extrabold transition active:scale-95"
              >
                Quitar filtro
              </button>
            )}
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-extrabold transition active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
