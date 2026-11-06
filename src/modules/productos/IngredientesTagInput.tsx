import React from 'react'
import { X, Plus, Sparkles } from 'lucide-react'
import { IngredientesTagInputProps } from '@/types/producto/producto.types'
import { useIngredientesTagInput } from '@/hooks/productos/useIngredientesTagInput'

export const IngredientesTagInput: React.FC<IngredientesTagInputProps> = (props) => {
  const { ingredientes, onRemover } = props
  const {
    inputTexto,
    setInputTexto,
    sugerenciasBD,
    mostrarDropdown,
    setMostrarDropdown,
    indiceSeleccionado,
    setIndiceSeleccionado,
    contenedorRef,
    inputRef,
    sugerenciasFiltradas,
    sugerenciasRapidas,
    handleAgregarActual,
    handleKeyDown,
    handlePaste,
  } = useIngredientesTagInput(props)

  return (
    <div ref={contenedorRef} className="relative">
      {/* CONTENEDOR PRINCIPAL TIPO CHIPS */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="w-full min-h-[50px] bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center gap-1.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20 transition cursor-text"
      >
        {/* LISTA DE CHIPS ACTIVOS */}
        {ingredientes.map((ing) => (
          <span
            key={ing}
            className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-lg animate-in fade-in zoom-in-95 duration-150 select-none group"
          >
            <span>{ing}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemover(ing)
              }}
              className="text-amber-500/70 hover:text-rose-400 p-0.5 rounded transition"
              title={`Quitar ${ing}`}
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </span>
        ))}

        {/* INPUT DE ESCRITURA */}
        <input
          ref={inputRef}
          type="text"
          value={inputTexto}
          onChange={(e) => {
            setInputTexto(e.target.value)
            setMostrarDropdown(true)
            setIndiceSeleccionado(-1)
          }}
          onFocus={() => {
            if (sugerenciasFiltradas.length > 0) setMostrarDropdown(true)
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            ingredientes.length === 0
              ? 'Escribe un ingrediente y presiona Enter o coma...'
              : 'Añadir otro...'
          }
          className="bg-transparent border-none text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none flex-1 min-w-[150px] py-1 px-1"
        />
      </div>

      {/* DROPDOWN DE SUGERENCIAS / AUTOCOMPLETADO */}
      {mostrarDropdown && inputTexto.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in duration-150">
          {!sugerenciasBD.some(
            (s) => s.toLowerCase() === inputTexto.trim().toLowerCase()
          ) && (
            <button
              type="button"
              onClick={() => handleAgregarActual()}
              className="w-full text-left px-3.5 py-2.5 text-xs text-amber-400 hover:bg-slate-800/80 font-bold flex items-center gap-2 border-b border-slate-800/60 transition"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Añadir nuevo: <span className="underline">"{inputTexto.trim()}"</span>
              </span>
            </button>
          )}

          {sugerenciasFiltradas.length > 0 ? (
            sugerenciasFiltradas.map((sug, idx) => {
              const estaSeleccionado = idx === indiceSeleccionado
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAgregarActual(sug)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                    estaSeleccionado
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <span>{sug}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Existente</span>
                </button>
              )
            })
          ) : (
            <div className="px-3.5 py-2 text-[11px] text-slate-500 italic">
              Presiona Enter para crear este ingrediente
            </div>
          )}
        </div>
      )}

      {/* SUGERENCIAS RÁPIDAS ABAJO */}
      {sugerenciasRapidas.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400/80" />
            <span>Sugeridos:</span>
          </span>
          {sugerenciasRapidas.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => handleAgregarActual(sug)}
              className="text-[10px] font-bold text-slate-400 hover:text-amber-300 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-lg px-2 py-0.5 transition active:scale-95"
            >
              + {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
