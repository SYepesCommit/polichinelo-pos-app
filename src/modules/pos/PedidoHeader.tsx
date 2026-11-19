import React from 'react'
import {
  UserCheck,
  UserPlus,
  MapPin,
  FileText,
  Phone,
  User,
  Search,
  MessageSquare,
  Sparkles,
  ClipboardPaste,
  RotateCcw,
} from 'lucide-react'
import { PedidoHeaderProps } from '@/types/pos/pedidoHeader.types'
import { usePedidoHeader } from '@/hooks/pos/usePedidoHeader'
import { UltimoPedidoCliente } from '@/hooks/pos/usePosCliente'

export const PedidoHeader: React.FC<
  PedidoHeaderProps & {
    observacionesGenerales?: string
    setObservacionesGenerales?: (val: string) => void
    onAbrirWhatsAppModal?: () => void
    onPegarTelefonoRapido?: () => void
    ultimoPedidoCliente?: UltimoPedidoCliente | null
    onRepetirUltimoPedido?: () => void
  }
> = ({
  tipoPedido,
  setTipoPedido,
  nombreCliente,
  setNombreCliente,
  telefono,
  handleTelefonoChange,
  handleBuscarCliente,
  direccionCliente,
  setDireccionCliente,
  referenciaCliente,
  setReferenciaCliente,
  observacionesGenerales = '',
  setObservacionesGenerales,
  clienteExiste,
  onAbrirWhatsAppModal,
  onPegarTelefonoRapido,
  ultimoPedidoCliente,
  onRepetirUltimoPedido,
}) => {
  const { handleKeyDownTelefono } = usePedidoHeader({ handleBuscarCliente })

  const tiposDisponibles = ['MESA', 'LLEVAR', 'DOMICILIO'] as const

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 space-y-3 select-none">
      {/* Selector de Tipo de Pedido + Atajos de WhatsApp */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          {tiposDisponibles.map((tipo) => {
            const esActivo = tipoPedido === tipo
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoPedido(tipo)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition touch-manipulation active:scale-95 ${
                  esActivo
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tipo}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {onPegarTelefonoRapido && (
            <button
              type="button"
              onClick={onPegarTelefonoRapido}
              title="Pegar teléfono del portapapeles y buscar cliente automáticamente"
              className="px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-emerald-500/40 flex items-center gap-1.5 transition active:scale-95"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pegar Tel</span>
            </button>
          )}

          {onAbrirWhatsAppModal && (
            <button
              type="button"
              onClick={onAbrirWhatsAppModal}
              title="Pegar mensaje de WhatsApp para armar el pedido automáticamente"
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Armar de WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* CAMPOS COMUNES (NOMBRE OBLIGATORIO Y NOTAS GENERALES EN TODOS LOS PEDIDOS) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* NOMBRE DEL CLIENTE (OBLIGATORIO EN TODOS LOS TIPOS DE ORDEN) */}
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre del cliente *"
              className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none transition ${
                !nombreCliente.trim()
                  ? 'border-amber-500/50 focus:border-amber-500'
                  : 'border-slate-800 focus:border-amber-500'
              }`}
              required
            />
          </div>

          {/* OBSERVACIONES DEL PEDIDO (VISIBLE EN MESA, LLEVAR Y DOMICILIO) */}
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={observacionesGenerales}
              onChange={(e) => setObservacionesGenerales && setObservacionesGenerales(e.target.value)}
              placeholder="Notas del pedido (Ej: Salsas aparte, Llevar devuelta, Servir rápido...) (Opcional)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* BLOQUE EXCLUSIVO DE DOMICILIO */}
      {tipoPedido === 'DOMICILIO' && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
          {/* Banner Informativo de Estado de Cliente */}
          {telefono.trim().length >= 7 && (
            <div>
              {clienteExiste === true && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <div className="truncate">
                      <span>Cliente encontrado.</span>
                      {ultimoPedidoCliente && ultimoPedidoCliente.items.length > 0 && (
                        <span className="ml-1.5 text-[11px] text-emerald-300/80 font-medium">
                          Último pedido:{' '}
                          {ultimoPedidoCliente.items
                            .map((it) => `${it.cantidad}x ${it.nombre}`)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {ultimoPedidoCliente &&
                    ultimoPedidoCliente.items.length > 0 &&
                    onRepetirUltimoPedido && (
                      <button
                        type="button"
                        onClick={onRepetirUltimoPedido}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-sm"
                        title="Agregar los productos de su último pedido a la comanda"
                      >
                        <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                        <span>Repetir último pedido</span>
                      </button>
                    )}
                </div>
              )}

              {clienteExiste === false && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <UserPlus className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Cliente nuevo. Se guardará automáticamente al finalizar la orden.</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* TELÉFONO */}
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={telefono}
                onChange={handleTelefonoChange}
                onBlur={handleBuscarCliente}
                onKeyDown={handleKeyDownTelefono}
                placeholder="Teléfono (ej: 3001234567)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleBuscarCliente}
                title="Buscar cliente"
                className="absolute right-2 p-1 text-slate-500 hover:text-amber-500 transition rounded-lg hover:bg-slate-800 touch-manipulation active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* DIRECCIÓN DE ENTREGA */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={direccionCliente}
                onChange={(e) => setDireccionCliente(e.target.value)}
                placeholder="Dirección de entrega"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* REFERENCIA DE DIRECCIÓN */}
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={referenciaCliente}
              onChange={(e) => setReferenciaCliente(e.target.value)}
              placeholder="Referencia de la dirección (Ej: Apto 302, Casa esquinera, Timbrar duro...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}