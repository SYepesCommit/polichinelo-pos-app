import React from 'react'
import { KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { CambiarPinModalProps } from '@/types/seguridad/seguridad.types'
import { useCambiarPin } from '@/hooks/seguridad/useCambiarPin'
import { NumericKeypad } from './NumericKeypad'

export const CambiarPinModal: React.FC<CambiarPinModalProps> = ({ onCerrar }) => {
  const {
    paso,
    pinInput,
    errorMsg,
    procesando,
    titulo,
    subtitulo,
    handleTecla,
    handleBorrar,
  } = useCambiarPin(onCerrar)

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xs p-6 shadow-2xl relative flex flex-col items-center">
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
            paso === 'EXITO'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-amber-500/10'
          }`}
        >
          {paso === 'EXITO' ? (
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>

        <h3 className="text-base font-black text-slate-100 text-center tracking-wide">
          {titulo}
        </h3>
        <p className="text-[11px] text-slate-400 text-center mt-1 mb-5 font-medium leading-relaxed px-2">
          {subtitulo}
        </p>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-bold mb-4 text-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {paso !== 'EXITO' && (
          <NumericKeypad
            pinLength={pinInput.length}
            error={Boolean(errorMsg)}
            disabled={procesando}
            onDigit={handleTecla}
            onDelete={handleBorrar}
            onCancel={onCerrar}
          />
        )}
      </div>
    </div>
  )
}
