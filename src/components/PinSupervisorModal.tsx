import React from 'react'
import { Lock, X, AlertCircle } from 'lucide-react'
import { PinSupervisorModalProps } from '@/types/seguridad/seguridad.types'
import { usePinSupervisor } from '@/hooks/seguridad/usePinSupervisor'
import { NumericKeypad } from './NumericKeypad'

export const PinSupervisorModal: React.FC<PinSupervisorModalProps> = ({
  titulo = 'Autorización Requerida',
  descripcion = 'Ingresa el PIN de administrador o supervisor para continuar',
  onExito,
  onCancelar,
}) => {
  const { pin, error, verificando, handleTecla, handleBorrar } = usePinSupervisor(onExito)

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xs p-6 shadow-2xl relative flex flex-col items-center">
        <button
          type="button"
          onClick={onCancelar}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-800 transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
          <Lock className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-base font-black text-slate-100 text-center tracking-wide">
          {titulo}
        </h3>
        <p className="text-[11px] text-slate-400 text-center mt-1 mb-5 font-medium leading-relaxed px-2">
          {descripcion}
        </p>

        {error && (
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-4 animate-shake">
            <AlertCircle className="w-4 h-4" />
            <span>PIN Incorrecto</span>
          </div>
        )}

        <NumericKeypad
          pinLength={pin.length}
          error={error}
          disabled={verificando}
          onDigit={handleTecla}
          onDelete={handleBorrar}
          onCancel={onCancelar}
        />
      </div>
    </div>
  )
}
