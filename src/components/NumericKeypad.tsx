import React from 'react'
import { Delete } from 'lucide-react'
import { NumericKeypadProps } from '@/types/seguridad/seguridad.types'

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  pinLength,
  error,
  disabled = false,
  onDigit,
  onDelete,
  onCancel,
}) => {
  return (
    <>
      {/* INDICADORES DEL PIN (4 PUNTOS) */}
      <div className="flex items-center gap-3 mb-5">
        {[0, 1, 2, 3].map((idx) => {
          const lleno = pinLength > idx
          return (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                error
                  ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                  : lleno
                  ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/40'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          )
        })}
      </div>

      {/* TECLADO NUMÉRICO TÁCTIL */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(d)}
            className="h-14 rounded-2xl bg-slate-950 border border-slate-800/90 text-slate-100 hover:bg-slate-800/80 hover:border-amber-500/40 text-lg font-black transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={onCancel}
          className="h-14 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all active:scale-95"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDigit('0')}
          className="h-14 rounded-2xl bg-slate-950 border border-slate-800/90 text-slate-100 hover:bg-slate-800/80 hover:border-amber-500/40 text-lg font-black transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="h-14 rounded-2xl bg-slate-950 border border-slate-800/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 flex items-center justify-center transition-all active:scale-95 shadow-sm disabled:opacity-50"
          title="Borrar"
        >
          <Delete className="w-5 h-5 stroke-[2]" />
        </button>
      </div>
    </>
  )
}
