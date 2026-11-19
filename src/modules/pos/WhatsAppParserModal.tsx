import React, { useState, useEffect } from 'react'
import {
  X,
  ClipboardPaste,
  Copy,
  Check,
  Sparkles,
  User,
  Phone,
  MapPin,
  Navigation,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UserCheck,
  CreditCard,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { Banco, Categoria, ItemCarrito, MetodoPago, TipoPedido } from '@/types/pos/pos'
import { UltimoPedidoCliente } from '@/hooks/pos/usePosCliente'
import {
  analizarMensajeWhatsApp,
  ItemDetectadoWhatsApp,
  PLANTILLA_WHATSAPP_CLIENTE,
} from '@/utils/whatsappPos.utils'

interface WhatsAppParserModalProps {
  categorias: Categoria[]
  adicionesDisponibles: { nombre: string; precio: number }[]
  metodosPago: MetodoPago[]
  bancos: Banco[]
  onCerrar: () => void
  onAplicarPedidoWhatsApp: (datos: {
    tipoPedido: TipoPedido
    nombreCliente: string
    telefono: string
    direccion: string
    referencia: string
    montoDomicilio?: number
    metodoPagoTexto?: 'EFECTIVO' | 'TRANSFERENCIA' | null
    bancoId?: string | null
    items: ItemCarrito[]
  }) => void
}

export const WhatsAppParserModal: React.FC<WhatsAppParserModalProps> = ({
  categorias,
  adicionesDisponibles,
  bancos,
  onCerrar,
  onAplicarPedidoWhatsApp,
}) => {
  const [texto, setTexto] = useState('')
  const [plantillaCopiada, setPlantillaCopiada] = useState(false)
  const [clienteBD, setClienteBD] = useState<{
    nombre: string
    direccion: string
    referenciaDireccion?: string
    ultimoPedido?: UltimoPedidoCliente | null
  } | null>(null)

  // Estados editables de la vista previa
  const [tipoPedido, setTipoPedido] = useState<TipoPedido>('DOMICILIO')
  const [telefono, setTelefono] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')
  const [direccion, setDireccion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [montoDomicilio, setMontoDomicilio] = useState<number>(0)
  const [metodoPagoTexto, setMetodoPagoTexto] = useState<'EFECTIVO' | 'TRANSFERENCIA' | null>(null)
  const [bancoId, setBancoId] = useState<string | null>(null)
  const [itemsDetectados, setItemsDetectados] = useState<ItemDetectadoWhatsApp[]>([])

  // Analizar automáticamente cada vez que cambia el texto pegado
  useEffect(() => {
    const res = analizarMensajeWhatsApp(texto, categorias, adicionesDisponibles, bancos)
    setTipoPedido(res.tipoPedido)
    setTelefono(res.telefono)
    setNombreCliente(res.nombreCliente)
    setDireccion(res.direccion)
    setReferencia(res.referencia)
    if (res.montoDomicilio > 0) setMontoDomicilio(res.montoDomicilio)
    setMetodoPagoTexto(res.metodoPagoTexto)
    setBancoId(res.bancoIdDetectado)
    setItemsDetectados(res.items)
  }, [texto, categorias, adicionesDisponibles, bancos])

  // Si se detecta un teléfono de 7+ dígitos, buscar automáticamente en la base de datos de clientes
  useEffect(() => {
    const telLimpio = telefono.replace(/\D/g, '')
    if (telLimpio.length < 7 || !window.electronAPI?.getClienteByTelefono) {
      setClienteBD(null)
      return
    }

    let cancelado = false
    window.electronAPI
      .getClienteByTelefono(telLimpio)
      .then((cliente) => {
        if (cancelado) return
        if (cliente) {
          setClienteBD(cliente)
          setNombreCliente((prev) => prev || cliente.nombre || '')
          setDireccion((prev) => prev || cliente.direccion || '')
          setReferencia((prev) => prev || cliente.referenciaDireccion || '')
        } else {
          setClienteBD(null)
        }
      })
      .catch(() => {
        if (!cancelado) setClienteBD(null)
      })

    return () => {
      cancelado = true
    }
  }, [telefono])

  const handlePegarPortapapeles = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (clip) setTexto(clip)
    } catch (error) {
      console.error('No se pudo leer el portapapeles:', error)
    }
  }

  const handleCopiarPlantilla = async () => {
    try {
      await navigator.clipboard.writeText(PLANTILLA_WHATSAPP_CLIENTE)
      setPlantillaCopiada(true)
      setTimeout(() => setPlantillaCopiada(false), 2500)
    } catch (error) {
      console.error('Error copiando plantilla:', error)
    }
  }

  const cambiarCantidadItem = (idTemp: string, delta: number) => {
    setItemsDetectados((prev) =>
      prev
        .map((it) =>
          it.idTemp === idTemp ? { ...it, cantidad: Math.max(0, it.cantidad + delta) } : it
        )
        .filter((it) => it.cantidad > 0)
    )
  }

  const eliminarItemDetectado = (idTemp: string) => {
    setItemsDetectados((prev) => prev.filter((it) => it.idTemp !== idTemp))
  }

  // Si un producto tiene cantidad >= 2 y una adición/exclusión ambigua (ej. "2 Maicitos + Queso"),
  // permite en 1 clic dejar (N-1) normales y solo 1 con la adición/exclusión
  const separarSoloUnoConNota = (idTemp: string) => {
    setItemsDetectados((prev) => {
      const idx = prev.findIndex((it) => it.idTemp === idTemp)
      if (idx === -1) return prev
      const actual = prev[idx]
      if (actual.cantidad <= 1 || !actual.observaciones) return prev

      const precioBase = actual.producto.precioBase ?? actual.producto.precio
      const itemSinNota: ItemDetectadoWhatsApp = {
        ...actual,
        idTemp: `${actual.idTemp}-base`,
        cantidad: actual.cantidad - 1,
        observaciones: '',
        producto: {
          ...actual.producto,
          precio: precioBase,
        },
      }
      const itemConNota: ItemDetectadoWhatsApp = {
        ...actual,
        cantidad: 1,
      }

      const copia = [...prev]
      copia.splice(idx, 1, itemSinNota, itemConNota)
      return copia
    })
  }

  const handleCargarUltimoPedidoEnModal = () => {
    const ultimo = clienteBD?.ultimoPedido
    if (!ultimo || !Array.isArray(ultimo.items)) return
    const todosProductos = categorias.flatMap((c) => c.productos)
    const itemsUltimo: ItemDetectadoWhatsApp[] = ultimo.items.map((it, idx) => {
      const prodCatalogo = todosProductos.find((p) => String(p.id) === String(it.productoId))
      const extraGuardado = Math.max(0, (it.precioUnitario || 0) - (it.precioBase || 0))
      const precioBaseActual = prodCatalogo ? prodCatalogo.precio : it.precioBase || it.precioUnitario
      return {
        idTemp: `wa-rep-${it.productoId}-${Date.now()}-${idx}`,
        producto: prodCatalogo
          ? {
              ...prodCatalogo,
              precioBase: precioBaseActual,
              precio: precioBaseActual + extraGuardado,
            }
          : {
              id: it.productoId || 'item-libre',
              nombre: it.nombre,
              precio: it.precioUnitario,
              precioBase: it.precioBase || it.precioUnitario,
            },
        cantidad: it.cantidad,
        observaciones: it.observaciones || '',
        lineaOriginal: 'Último pedido del cliente',
      }
    })
    setItemsDetectados((prev) => [...prev, ...itemsUltimo])
    if (ultimo.montoDomicilio > 0 && montoDomicilio === 0) {
      setMontoDomicilio(ultimo.montoDomicilio)
    }
  }

  const handleConfirmarCarga = () => {
    onAplicarPedidoWhatsApp({
      tipoPedido,
      nombreCliente: nombreCliente.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      referencia: referencia.trim(),
      montoDomicilio: montoDomicilio > 0 ? montoDomicilio : undefined,
      metodoPagoTexto,
      bancoId,
      items: itemsDetectados.map((it) => ({
        idTemp: it.idTemp,
        producto: it.producto,
        cantidad: it.cantidad,
        observaciones: it.observaciones,
      })),
    })
    onCerrar()
  }

  const formatMoneda = (n: number) => Math.round(n).toLocaleString('es-CO')
  const subtotalDetectado = itemsDetectados.reduce(
    (acc, it) => acc + (it.producto.precio || 0) * it.cantidad,
    0
  )

  const hayDatosParaCargar =
    Boolean(nombreCliente.trim()) ||
    Boolean(telefono.trim()) ||
    Boolean(direccion.trim()) ||
    itemsDetectados.length > 0

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        <button
          type="button"
          onClick={onCerrar}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Armar Pedido desde WhatsApp
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Pega el mensaje del cliente y el sistema detectará teléfono, dirección, productos y medio de pago.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopiarPlantilla}
            className={`px-3 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
              plantillaCopiada
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Copia una plantilla para enviársela al cliente por WhatsApp"
          >
            {plantillaCopiada ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>¡Plantilla Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiar Plantilla para Cliente</span>
              </>
            )}
          </button>
        </div>

        {/* CUERPO EN 2 COLUMNAS */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0 custom-scrollbar">
          {/* COLUMNA IZQUIERDA: TEXTO DE WHATSAPP */}
          <div className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                1. Mensaje de WhatsApp
              </label>
              <button
                type="button"
                onClick={handlePegarPortapapeles}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Pegar del Portapapeles</span>
              </button>
            </div>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={`Pega aquí el chat o mensaje del cliente...\n\nEjemplo:\nJuan Pérez\n3001234567\nCalle 15 # 8-20 Barrio Centro\n2 Hamburguesas Polichinelo sin cebolla\n1 Coca-Cola 1.5L\nPago por Nequi`}
              className="flex-1 min-h-[240px] w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-medium text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
              autoFocus
            />

            <p className="text-[11px] text-slate-500 font-medium">
              Tip: Si el teléfono ya está registrado en Polichinelo, el sistema completará el nombre y dirección guardados automáticamente.
            </p>
          </div>

          {/* COLUMNA DERECHA: VISTA PREVIA DETECTADA */}
          <div className="flex flex-col space-y-3 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                2. Datos y Productos Detectados
              </span>
              <div className="flex gap-1">
                {(['DOMICILIO', 'LLEVAR', 'MESA'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoPedido(t)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition ${
                      tipoPedido === t
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {clienteBD && (
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">Cliente frecuente encontrado en BD.</span>
                </div>
                {clienteBD.ultimoPedido && clienteBD.ultimoPedido.items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCargarUltimoPedidoEnModal}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shrink-0 transition active:scale-95"
                    title="Cargar los productos de su último pedido"
                  >
                    <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                    <span>Repetir último</span>
                  </button>
                )}
              </div>
            )}

            {/* DATOS DEL CLIENTE EDITABLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none"
                />
              </div>

              <div className="relative">
                <User className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none"
                />
              </div>

              <div className="relative sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none"
                />
              </div>

              <div className="relative sm:col-span-2">
                <Navigation className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Barrio / Referencia / Apartamento"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* PAGO Y DOMICILIO DETECTADOS */}
            {(metodoPagoTexto || montoDomicilio > 0) && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {metodoPagoTexto && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-extrabold">
                    <CreditCard className="w-3 h-3" />
                    <span>
                      Pago: {metodoPagoTexto}
                      {bancoId
                        ? ` (${bancos.find((b) => b.id === bancoId)?.nombre || ''})`
                        : ''}
                    </span>
                  </span>
                )}
                {montoDomicilio > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold">
                    <Truck className="w-3 h-3" />
                    <span>Domicilio: ${formatMoneda(montoDomicilio)}</span>
                  </span>
                )}
              </div>
            )}

            {/* PRODUCTOS DETECTADOS */}
            <div className="flex-1 flex flex-col min-h-[130px] pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-300 uppercase flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  Productos Reconocidos ({itemsDetectados.length})
                </span>
                {subtotalDetectado > 0 && (
                  <span className="text-xs font-black text-amber-400">
                    Subtotal: ${formatMoneda(subtotalDetectado)}
                  </span>
                )}
              </div>

              {itemsDetectados.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/60 text-[11px] text-slate-500 font-semibold">
                  Escribe o pega los productos del pedido (ej: &quot;2 hamburguesas polichinelo sin cebolla&quot;)
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {itemsDetectados.map((it) => (
                    <div
                      key={it.idTemp}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-100 truncate">
                          {it.producto.nombre}
                        </p>
                        {it.observaciones && (
                          <div className="mt-0.5 space-y-1">
                            <p className="text-[10px] font-bold text-amber-300/90 truncate">
                              {it.observaciones}
                            </p>
                            {it.cantidad > 1 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  En las {it.cantidad} unds (${formatMoneda(it.producto.precio)} c/u)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => separarSoloUnoConNota(it.idTemp)}
                                  className="px-2 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/35 text-sky-300 text-[10px] font-extrabold transition active:scale-95"
                                  title="Dejar la adición o nota solo en 1 unidad y el resto normal"
                                >
                                  ¿Solo en 1? Separar
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Total ítem: ${formatMoneda(it.producto.precio * it.cantidad)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => cambiarCantidadItem(it.idTemp, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-amber-400">
                          {it.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidadItem(it.idTemp, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarItemDetectado(it.idTemp)}
                          className="w-6 h-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center ml-1 active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!hayDatosParaCargar}
            onClick={handleConfirmarCarga}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Cargar Datos y Productos al Pedido</span>
          </button>
        </div>
      </div>
    </div>
  )
}
