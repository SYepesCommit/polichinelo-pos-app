import React from 'react'
import { ItemCarrito } from '../../types/pos/pos'
import { Edit3, Minus, Plus, Trash2 } from 'lucide-react'

interface ComandaItemCardProps {
  item: ItemCarrito
  formatMoneda: (monto: any) => string
  onEditarItem: (item: ItemCarrito) => void
  onCambiarCantidad: (idTemp: string, delta: number) => void
  onEliminarItem: (idTemp: string) => void
}

export const ComandaItemCard: React.FC<ComandaItemCardProps> = ({
  item,
  formatMoneda,
  onEditarItem,
  onCambiarCantidad,
  onEliminarItem,
}) => {
  return (
    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-2">
          <h4 className="font-bold text-sm text-slate-200">{item.producto.nombre}</h4>
          <span className="text-xs text-amber-400 font-semibold">
            ${formatMoneda((item.producto?.precio || 0) * item.cantidad)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEditarItem(item)}
          className="text-xs text-amber-400 hover:underline font-medium bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1 touch-manipulation active:scale-95"
        >
          <Edit3 className="w-3 h-3" />
          <span>{item.observaciones ? 'Editar' : 'Personalizar'}</span>
        </button>
      </div>

      {item.observaciones && (
        <div className="mt-2 text-xs space-y-2">
          {item.observaciones
            .split(item.observaciones.includes(' | ') ? ' | ' : '\n')
            .map((grupo, idx) => {
              if (!grupo.trim()) return null

              const gTrim = grupo.trim()
              const gUpper = gTrim.toUpperCase()

              const esCarne = gUpper.startsWith('CARNE:')
              const esSalsas = gUpper.startsWith('SALSAS:') || gUpper.startsWith('SALSA:')
              const esSin = gUpper.startsWith('SIN:') || gUpper.startsWith('SIN ')
              const esAdicion =
                gUpper.startsWith('ADICIÓN:') ||
                gUpper.startsWith('ADICION:') ||
                gUpper.startsWith('EXTRA ')
              const esNota = gUpper.startsWith('NOTA:')

              if (esCarne) {
                const contenido = gTrim.replace(/^CARNE:\s*/i, '').trim()
                if (!contenido) return null

                return (
                  <div
                    key={idx}
                    className="bg-amber-500/15 border border-amber-500/35 rounded-xl px-2.5 py-1.5 flex items-center justify-between"
                  >
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      CARNE ELEGIDA:
                    </span>
                    <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md text-[11px] font-black uppercase">
                      {contenido}
                    </span>
                  </div>
                )
              }

              if (esSalsas) {
                const contenido = gTrim.replace(/^SALSAS?:\s*/i, '')
                const items = contenido
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                if (items.length === 0) return null

                return (
                  <div key={idx} className="bg-sky-500/10 border border-sky-500/25 rounded-xl p-2">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block mb-1">
                      SALSAS:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it, i) => (
                        <span
                          key={i}
                          className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold"
                        >
                          • {it}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              }

              if (esSin) {
                const contenido = gTrim.replace(/^SIN:\s*/i, '')
                const items = contenido.split(',').map((s) => s.trim()).filter(Boolean)
                if (items.length === 0) return null

                return (
                  <div key={idx} className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-1">
                      SIN (Quitar):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it, i) => (
                        <span
                          key={i}
                          className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold"
                        >
                          • {it}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              }

              if (esAdicion) {
                const contenido = gTrim.replace(/^ADICI[ÓO]N:\s*/i, '')
                const items = contenido.split(',').map((a) => a.trim()).filter(Boolean)
                if (items.length === 0) return null

                return (
                  <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block mb-1">
                      ADICIONES / TÉRMINO:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {items.map((it, i) => (
                        <span
                          key={i}
                          className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold"
                        >
                          + {it}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              }

              const contenidoNota = esNota ? gTrim.replace(/^NOTA:\s*/i, '').trim() : gTrim
              if (!contenidoNota) return null

              return (
                <div key={idx} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-0.5">
                    NOTA PARA COCINA:
                  </span>
                  <p className="text-[11px] font-semibold text-amber-300 italic whitespace-pre-line leading-snug">
                    {contenidoNota}
                  </p>
                </div>
              )
            })}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-900">
        <button
          type="button"
          onClick={() => onCambiarCantidad(item.idTemp, -1)}
          className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition touch-manipulation active:scale-95"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-bold w-5 text-center">{item.cantidad}</span>
        <button
          type="button"
          onClick={() => onCambiarCantidad(item.idTemp, 1)}
          className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition touch-manipulation active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onEliminarItem(item.idTemp)}
          className="p-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ml-1 transition touch-manipulation active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}