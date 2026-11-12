import React, { useEffect, useState } from 'react'
import { Delete, Keyboard, EyeOff, Eye } from 'lucide-react'
import { NumericKeypadProps } from '@/types/seguridad/seguridad.types'

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  pinLength,
  error,
  disabled = false,
  onDigit,
  onDelete,
  onCancel,
}) => {
  const [ocultarTecladoPantalla, setOcultarTecladoPantalla] = useState<boolean>(() => {
    return localStorage.getItem('ocultar_teclado_pin') === 'true'
  })

  const toggleVisibilidadTeclado = () => {
    setOcultarTecladoPantalla((prev) => {
      const nuevo = !prev
      localStorage.setItem('ocultar_teclado_pin', String(nuevo))
      return nuevo
    })
  }

  // Escuchar teclado físico (fila numérica superior y Numpad) sin mostrar qué tecla se hundió en pantalla
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        onDigit(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        onDelete()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, onDigit, onDelete, onCancel])

  return (
    <>
      {/* INDICADORES DEL PIN (4 PUNTOS) */}
      <div className="flex items-center gap-3 mb-3">
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

      {/* AVISO Y SWITCH DE PRIVACIDAD (TECLADO FÍSICO VS PANTALLA) */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold">
          <Keyboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Puedes digitar con tu teclado físico</span>
        </span>
        <button
          type="button"
          onClick={toggleVisibilidadTeclado}
          className="text-amber-400 hover:underline font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          title={
            ocultarTecladoPantalla
              ? 'Mostrar números en pantalla'
              : 'Ocultar números en pantalla para mayor privacidad'
          }
        >
          {ocultarTecladoPantalla ? (
            <>
              <Eye className="w-3 h-3" />
              <span>Ver números</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              <span>Ocultar</span>
            </>
          )}
        </button>
      </div>

      {/* TECLADO NUMÉRICO TÁCTIL (OPCIONAL SI ESTÁ OCULTO POR PRIVACIDAD) */}
      {ocultarTecladoPantalla ? (
        <div className="w-full space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-dashed border-slate-800 text-center">
            <p className="text-xs font-bold text-slate-300">
              Modo Privado Activo
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Escribe los 4 dígitos en el teclado físico (`0-9`) o presiona `Backspace` para borrar.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            Cancelar (`Esc`)
          </button>
        </div>
      ) : (
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
      )}
    </>
  )
}
