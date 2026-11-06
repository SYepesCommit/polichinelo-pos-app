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

  // Acción en blanco mientras se conecta y configura la impresora térmica física
  const handleImprimirDirecto = () => {}

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* ENCABEZADO MODAL */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              Vista Previa de Comanda #{datosTicket.consecutivo}
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

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800 flex-wrap">
          <button
            type="button"
            onClick={handleImprimirDirecto}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
            title="Imprimir en impresora térmica (Pendiente de conexión)"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleDescargar}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleAbrirNavegador}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Tamaño Real</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition active:scale-95"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
