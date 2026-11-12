import React, { useEffect, useState } from 'react'
import { X, Download, ExternalLink, Printer } from 'lucide-react'
import { DatosComandaCocina } from '../../types/pos/posView.types'
import { generarTicketPDF } from '../../services/ticketPdf.service'

interface TicketPreviewModalProps {
  datosTicket: DatosComandaCocina
  onClose: () => void
}

export const TicketPreviewModal: React.FC<TicketPreviewModalProps> = ({
  datosTicket,
  onClose,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [imprimiendo, setImprimiendo] = useState(false)
  const [copiasImpresas, setCopiasImpresas] = useState(0)
  const [mensajeEstado, setMensajeEstado] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  useEffect(() => {
    const doc = generarTicketPDF(datosTicket)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [datosTicket])

  const handleDescargar = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `Comanda_Orden_${datosTicket.consecutivo}.pdf`
    a.click()
  }

  const handleAbrirNavegador = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  // 🔴 Impresión directa silenciosa a la impresora térmica sin márgenes ni diálogo
  const handleImprimirDirecto = async () => {
    if (imprimiendo) return
    setImprimiendo(true)
    setMensajeEstado(null)

    try {
      if (window.electronAPI?.imprimirComanda) {
        const res = await window.electronAPI.imprimirComanda(datosTicket)
        if (res?.success) {
          const nuevoConteo = copiasImpresas + 1
          setCopiasImpresas(nuevoConteo)
          setMensajeEstado({
            tipo: 'ok',
            texto:
              nuevoConteo === 1
                ? '✅ ¡Comanda enviada a la térmica! Puedes imprimir otra copia o cerrar.'
                : `✅ ¡Copia #${nuevoConteo} enviada a la térmica!`,
          })
        } else {
          setMensajeEstado({
            tipo: 'error',
            texto: res?.error || 'No se pudo imprimir. Revisa que la impresora esté encendida.',
          })
        }
      } else {
        setMensajeEstado({
          tipo: 'error',
          texto: 'API de impresión directa no disponible.',
        })
      }
    } catch (err: any) {
      setMensajeEstado({
        tipo: 'error',
        texto: err.message || 'Error al imprimir comanda.',
      })
    } finally {
      setImprimiendo(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* ENCABEZADO MODAL */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              Comanda #{datosTicket.consecutivo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISOR DE PDF EMBEBIDO */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[380px]">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[380px] border-none"
              title="Vista previa de comanda"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Generando comanda...
            </div>
          )}
        </div>

        {/* MENSAJE DE ESTADO DE IMPRESIÓN */}
        {mensajeEstado && (
          <div
            className={`mt-3 py-2 px-3 rounded-xl text-xs font-bold text-center ${
              mensajeEstado.tipo === 'ok'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {mensajeEstado.texto}
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800 flex-wrap">
          {/* BOTÓN IMPRIMIR DIRECTO (DESTACADO) */}
          <button
            type="button"
            onClick={handleImprimirDirecto}
            disabled={imprimiendo}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
              imprimiendo
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
            title="Imprimir directamente en la impresora térmica"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>
              {imprimiendo
                ? 'Imprimiendo...'
                : copiasImpresas > 0
                  ? `Imprimir otra copia (${copiasImpresas})`
                  : 'Imprimir'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDescargar}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
            title="Descargar archivo PDF"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={handleAbrirNavegador}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
            title="Abrir en pestaña independiente"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Pestaña</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95 border border-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
