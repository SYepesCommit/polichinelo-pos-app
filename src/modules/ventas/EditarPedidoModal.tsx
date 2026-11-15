import React, { useState, useEffect } from 'react'
import {
  Pencil,
  X,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  User,
  Phone,
  MapPin,
  Navigation,
  MessageSquare,
  Lock,
  Check,
  Banknote,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  Split,
} from 'lucide-react'
import { EditarPedidoModalProps } from '@/types/ventas/ventas.types'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'

const VALORES_RAPIDOS_DOMICILIO = [3000, 4000, 5000, 6000, 7000]

export const EditarPedidoModal: React.FC<EditarPedidoModalProps> = ({
  venta,
  metodosPago,
  bancos,
  onCerrar,
  onConfirmarEdicion,
  formatMoneda,
}) => {
  const [tipoPedido, setTipoPedido] = useState<'MESA' | 'LLEVAR' | 'DOMICILIO'>('MESA')
  const [nombreCliente, setNombreCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [referenciaDireccion, setReferenciaDireccion] = useState('')
  const [montoDomicilio, setMontoDomicilio] = useState<number>(0)
  const [observacionesGenerales, setObservacionesGenerales] = useState('')

  // Estado de medio de pago
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>('EFECTIVO')
  const [esMixto, setEsMixto] = useState<boolean>(false)
  const [montoTransferencia, setMontoTransferencia] = useState<number>(0)
  const [requiereBanco, setRequiereBanco] = useState<boolean>(false)
  const [bancoSeleccionadoId, setBancoSeleccionadoId] = useState<string>('')

  const [pidiendoPin, setPidiendoPin] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!venta) return
    const tipoInicial = (venta.tipoPedido || 'MESA').toUpperCase() as
      | 'MESA'
      | 'LLEVAR'
      | 'DOMICILIO'
    setTipoPedido(tipoInicial)
    setNombreCliente(venta.cliente?.nombre || venta.nombreCliente || '')
    setTelefono(venta.cliente?.telefono || '')
    setDireccion(venta.cliente?.direccion || '')
    setReferenciaDireccion(venta.cliente?.referenciaDireccion || '')
    setMontoDomicilio(Number(venta.montoDomicilio || 0))
    setObservacionesGenerales(venta.observacionesGenerales || '')

    if (venta.esMixto && Array.isArray(venta.pagos) && venta.pagos.length > 1) {
      setEsMixto(true)
      setMetodoSeleccionado('MIXTO')
      setRequiereBanco(true)
      const pgTransf = venta.pagos.find((p) => !p.metodoPago.toUpperCase().includes('EFECTIVO'))
      setMontoTransferencia(Number(pgTransf?.monto || 0))
    } else {
      setEsMixto(false)
      const metodoActualObj = metodosPago.find(
        (m) =>
          m.codigo.toUpperCase() === venta.metodoPago.toUpperCase() ||
          m.nombre.toUpperCase() === venta.metodoPago.toUpperCase()
      )

      if (metodoActualObj) {
        setMetodoSeleccionado(metodoActualObj.codigo || metodoActualObj.nombre)
        setRequiereBanco(Boolean(metodoActualObj.requiereBanco))
      } else {
        const esEfvo = venta.metodoPago.toUpperCase().includes('EFECTIVO')
        setMetodoSeleccionado(esEfvo ? 'EFECTIVO' : 'TRANSFERENCIA')
        setRequiereBanco(!esEfvo)
      }
      setMontoTransferencia(Math.floor(venta.montoTotal / 2000) * 1000)
    }

    if (venta.bancoId) {
      setBancoSeleccionadoId(venta.bancoId)
    } else if (bancos.length > 0) {
      setBancoSeleccionadoId(bancos[0].id)
    }
  }, [venta, metodosPago, bancos])

  if (!venta) return null

  const subtotalProductos = (venta.items || []).reduce(
    (acc, it) => acc + Number(it.subtotal || it.cantidad * it.precioUnitario),
    0
  )

  const domicilioEfectivo = tipoPedido === 'DOMICILIO' ? Math.max(0, Number(montoDomicilio || 0)) : 0
  const nuevoTotal = subtotalProductos + domicilioEfectivo
  const diferenciaTotal = nuevoTotal - Number(venta.montoTotal || 0)
  const montoEfectivoMixto = Math.max(0, nuevoTotal - montoTransferencia)

  const listaMetodos =
    metodosPago.length > 0
      ? metodosPago
      : [
          { id: 'efvo', nombre: 'Efectivo', codigo: 'EFECTIVO', requiereBanco: false, activo: true, orden: 1 },
          { id: 'transf', nombre: 'Transferencia', codigo: 'TRANSFERENCIA', requiereBanco: true, activo: true, orden: 2 },
        ]

  const getIconoPago = (codigo: string) => {
    const c = codigo.toUpperCase()
    if (c.includes('TRANSFERENCIA') || c.includes('NEQUI')) return <QrCode className="w-4 h-4" />
    if (c.includes('TARJETA') || c.includes('DATAFONO')) return <CreditCard className="w-4 h-4" />
    if (c.includes('BONO')) return <Wallet className="w-4 h-4" />
    return <Banknote className="w-4 h-4" />
  }

  const handleSeleccionarMetodo = (mp: { codigo: string; nombre: string; requiereBanco: boolean }) => {
    setEsMixto(false)
    setMetodoSeleccionado(mp.codigo || mp.nombre)
    setRequiereBanco(Boolean(mp.requiereBanco))
    if (mp.requiereBanco && !bancoSeleccionadoId && bancos.length > 0) {
      setBancoSeleccionadoId(bancos[0].id)
    }
  }

  const handleSeleccionarMixto = () => {
    setEsMixto(true)
    setMetodoSeleccionado('MIXTO')
    setRequiereBanco(true)
    if (!bancoSeleccionadoId && bancos.length > 0) {
      setBancoSeleccionadoId(bancos[0].id)
    }
    if (!montoTransferencia || montoTransferencia >= nuevoTotal) {
      setMontoTransferencia(Math.floor(nuevoTotal / 2000) * 1000)
    }
  }

  const handleAutorizadoConPin = async () => {
    setPidiendoPin(false)
    setGuardando(true)
    try {
      await onConfirmarEdicion({
        pedidoId: venta.id,
        tipoPedido,
        nombreCliente: nombreCliente.trim() || 'Cliente Mostrador',
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        referenciaDireccion: referenciaDireccion.trim(),
        montoDomicilio: domicilioEfectivo,
        observacionesGenerales: observacionesGenerales.trim(),
        metodoPago: esMixto ? 'MIXTO' : metodoSeleccionado,
        bancoId: requiereBanco || esMixto ? bancoSeleccionadoId || null : null,
        esMixto,
        montoEfectivo: esMixto ? montoEfectivoMixto : undefined,
        montoTransferencia: esMixto ? montoTransferencia : undefined,
      })
      onCerrar()
    } catch (error) {
      console.error('Error editando datos del pedido:', error)
    } finally {
      setGuardando(false)
    }
  }

  const botonGuardarDeshabilitado =
    guardando ||
    (requiereBanco && !bancoSeleccionadoId) ||
    (esMixto &&
      (montoTransferencia <= 0 ||
        montoTransferencia >= nuevoTotal ||
        montoEfectivoMixto <= 0))

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
          <button
            type="button"
            onClick={onCerrar}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* CABECERA */}
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Editar Datos del Pedido
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Pedido #{venta.consecutivo} · {venta.hora}
              </p>
            </div>
          </div>

          {/* CUERPO CON SCROLL */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {/* 1. TIPO DE PEDIDO */}
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                1. Modalidad / Tipo de Pedido
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoPedido('MESA')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 ${
                    tipoPedido === 'MESA'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/15'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>MESA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPedido('LLEVAR')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 ${
                    tipoPedido === 'LLEVAR'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/15'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>PARA LLEVAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoPedido('DOMICILIO')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold transition active:scale-95 ${
                    tipoPedido === 'DOMICILIO'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/15'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>DOMICILIO</span>
                </button>
              </div>
            </div>

            {/* 2. DATOS DEL CLIENTE / DESTINO */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-3">
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                2. Datos del Cliente / Destino
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {tipoPedido === 'MESA' ? 'Nombre Cliente o Mesa' : 'Nombre del Cliente'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nombreCliente}
                      onChange={(e) => setNombreCliente(e.target.value)}
                      placeholder={tipoPedido === 'MESA' ? 'Ej: Mesa 4 / Juan' : 'Nombre del cliente'}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Teléfono / Celular
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 3001234567"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {(tipoPedido === 'DOMICILIO' || direccion || referenciaDireccion) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Dirección de Entrega
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle / Carrera / Número"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Barrio / Referencia
                    </label>
                    <div className="relative">
                      <Navigation className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={referenciaDireccion}
                        onChange={(e) => setReferenciaDireccion(e.target.value)}
                        placeholder="Barrio, piso, color de casa..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. VALOR DEL DOMICILIO (SOLO SI ES DOMICILIO) */}
            {tipoPedido === 'DOMICILIO' && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    Valor del Domicilio
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    ${formatMoneda(domicilioEfectivo)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {VALORES_RAPIDOS_DOMICILIO.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMontoDomicilio(val)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black border transition active:scale-95 ${
                        montoDomicilio === val
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40'
                      }`}
                    >
                      ${formatMoneda(val)}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={montoDomicilio || ''}
                    onChange={(e) => setMontoDomicilio(Math.max(0, Number(e.target.value)))}
                    placeholder="Otro valor..."
                    className="flex-1 min-w-[110px] bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-300 outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. MEDIO DE PAGO Y BANCO */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-3">
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block">
                3. Medio de Pago
              </span>

              <div className="grid grid-cols-3 gap-2">
                {listaMetodos.map((mp) => {
                  const valor = mp.codigo || mp.nombre
                  const seleccionado =
                    !esMixto && metodoSeleccionado.toUpperCase() === valor.toUpperCase()
                  return (
                    <button
                      key={mp.id}
                      type="button"
                      onClick={() => handleSeleccionarMetodo(mp)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                        seleccionado
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {getIconoPago(valor)}
                      <span className="truncate">{mp.nombre}</span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={handleSeleccionarMixto}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    esMixto
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Split className="w-4 h-4 shrink-0" />
                  <span className="truncate">Mixto</span>
                </button>
              </div>

              {esMixto && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/35 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-200">
                      Monto en Transferencia:
                    </span>
                    <div className="relative w-36 flex items-center">
                      <span className="absolute left-2.5 text-xs font-bold text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        max={nuevoTotal}
                        step="1000"
                        value={montoTransferencia || ''}
                        onChange={(e) => setMontoTransferencia(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-3 py-1.5 text-xs font-black text-sky-400 text-right focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
                    <span className="font-bold text-emerald-300">Restante en Efectivo:</span>
                    <span className="font-black text-emerald-400">
                      ${formatMoneda(montoEfectivoMixto)}
                    </span>
                  </div>
                </div>
              )}

              {requiereBanco && bancos.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Entidad / Banco:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {bancos.map((b) => {
                      const esBancoActivo = bancoSeleccionadoId === b.id
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBancoSeleccionadoId(b.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold text-center truncate transition active:scale-95 ${
                            esBancoActivo
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {b.nombre}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 5. OBSERVACIONES GENERALES */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3 h-3 text-amber-400" />
                Nota / Observación General del Pedido
              </label>
              <input
                type="text"
                value={observacionesGenerales}
                onChange={(e) => setObservacionesGenerales(e.target.value)}
                placeholder="Ej: Empacar salsas aparte, timbrar en el 2do piso..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
              />
            </div>

            {/* 6. RESUMEN DE PRODUCTOS (SOLO LECTURA PARA PROTEGER COCINA) */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Productos de Cocina (No editables)
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Subtotal: <strong className="text-slate-200">${formatMoneda(subtotalProductos)}</strong>
                </span>
              </div>

              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {(venta.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] text-slate-300 py-0.5 border-b border-slate-900 last:border-b-0"
                  >
                    <span className="font-bold truncate pr-2">
                      {it.cantidad}x {it.producto?.nombre || it.nombre}
                    </span>
                    <span className="font-semibold text-slate-400 shrink-0">
                      ${formatMoneda(it.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300">Nuevo Total del Pedido:</span>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400">
                    ${formatMoneda(nuevoTotal)}
                  </span>
                  {diferenciaTotal !== 0 && (
                    <span className="block text-[10px] font-bold text-emerald-400">
                      Se ajustará automáticamente en Arqueo de Caja
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3 mt-5 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={botonGuardarDeshabilitado}
              onClick={() => setPidiendoPin(true)}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{guardando ? 'Guardando...' : 'Guardar Cambios (PIN)'}</span>
            </button>
          </div>
        </div>
      </div>

      {pidiendoPin && (
        <PinSupervisorModal
          titulo="Autorizar Edición de Pedido"
          descripcion={`Ingresa el PIN de supervisor para modificar los datos del Pedido #${venta.consecutivo}.`}
          onExito={handleAutorizadoConPin}
          onCancelar={() => setPidiendoPin(false)}
        />
      )}
    </>
  )
}
