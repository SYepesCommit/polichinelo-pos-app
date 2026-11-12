import React, { useState, useEffect } from 'react'
import { ArrowLeftRight, X, Banknote, CreditCard, QrCode, Wallet, Building2, Split } from 'lucide-react'
import { CambiarMetodoPagoModalProps } from '@/types/ventas/ventas.types'
import { PinSupervisorModal } from '@/components/PinSupervisorModal'

export const CambiarMetodoPagoModal: React.FC<CambiarMetodoPagoModalProps> = ({
  venta,
  metodosPago,
  bancos,
  onCerrar,
  onConfirmarCambio,
  formatMoneda,
}) => {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>('EFECTIVO')
  const [esMixto, setEsMixto] = useState<boolean>(false)
  const [montoTransferencia, setMontoTransferencia] = useState<number>(0)
  const [requiereBanco, setRequiereBanco] = useState<boolean>(false)
  const [bancoSeleccionadoId, setBancoSeleccionadoId] = useState<string>('')
  const [pidiendoPin, setPidiendoPin] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!venta) return

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

  const montoEfectivoMixto = Math.max(0, venta.montoTotal - montoTransferencia)

  const getIcono = (codigo: string) => {
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
    if (!montoTransferencia || montoTransferencia >= venta.montoTotal) {
      setMontoTransferencia(Math.floor(venta.montoTotal / 2000) * 1000)
    }
  }

  const handleAutorizadoConPin = async () => {
    setPidiendoPin(false)
    setGuardando(true)
    try {
      await onConfirmarCambio({
        pedidoId: venta.id,
        metodoPago: esMixto ? 'MIXTO' : metodoSeleccionado,
        bancoId: requiereBanco || esMixto ? bancoSeleccionadoId || null : null,
        esMixto,
        montoEfectivo: esMixto ? montoEfectivoMixto : undefined,
        montoTransferencia: esMixto ? montoTransferencia : undefined,
      })
      onCerrar()
    } catch (error) {
      console.error('Error cambiando método de pago:', error)
    } finally {
      setGuardando(false)
    }
  }

  const listaMetodos =
    metodosPago.length > 0
      ? metodosPago
      : [
          { id: 'efvo', nombre: 'Efectivo', codigo: 'EFECTIVO', requiereBanco: false, activo: true, orden: 1 },
          { id: 'transf', nombre: 'Transferencia', codigo: 'TRANSFERENCIA', requiereBanco: true, activo: true, orden: 2 },
        ]

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
          <button
            type="button"
            onClick={onCerrar}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">
                Cambiar Medio de Pago
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Pedido #{venta.consecutivo} · Total{' '}
                <strong className="text-amber-400">${formatMoneda(venta.montoTotal)}</strong>
              </p>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Medio de pago actual:</span>
            <span className="font-black text-slate-200">
              {venta.metodoPago} {venta.bancoNombre ? `(${venta.bancoNombre})` : ''}
            </span>
          </div>

          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
            Selecciona el Nuevo Medio de Pago:
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {listaMetodos.map((mp) => {
              const valor = mp.codigo || mp.nombre
              const seleccionado = !esMixto && metodoSeleccionado.toUpperCase() === valor.toUpperCase()
              return (
                <button
                  key={mp.id}
                  type="button"
                  onClick={() => handleSeleccionarMetodo(mp)}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    seleccionado
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {getIcono(valor)}
                  <span className="truncate">{mp.nombre}</span>
                </button>
              )
            })}

            <button
              type="button"
              onClick={handleSeleccionarMixto}
              className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                esMixto
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Split className="w-4 h-4 shrink-0" />
              <span className="truncate">Mixto</span>
            </button>
          </div>

          {esMixto && (
            <div className="mb-4 p-3 rounded-2xl bg-slate-950 border border-sky-500/35 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-200">
                  Monto Transferencia:
                </span>
                <div className="relative w-36 flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    max={venta.montoTotal}
                    step="1000"
                    value={montoTransferencia || ''}
                    onChange={(e) => setMontoTransferencia(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-6 pr-3 py-1.5 text-xs font-black text-sky-400 text-right focus:outline-none focus:border-sky-500"
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

          {requiereBanco && (
            <div className="mb-5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Selecciona el Banco / Entidad:</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {bancos.map((b) => {
                  const esBancoActivo = bancoSeleccionadoId === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBancoSeleccionadoId(b.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left truncate transition active:scale-95 ${
                        esBancoActivo
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {b.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={
                guardando ||
                (requiereBanco && !bancoSeleccionadoId) ||
                (esMixto &&
                  (montoTransferencia <= 0 ||
                    montoTransferencia >= venta.montoTotal ||
                    montoEfectivoMixto <= 0))
              }
              onClick={() => setPidiendoPin(true)}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {guardando ? 'Actualizando...' : 'Autorizar con PIN'}
            </button>
          </div>
        </div>
      </div>

      {pidiendoPin && (
        <PinSupervisorModal
          titulo="Autorizar Cambio de Pago"
          descripcion={`Ingresa el PIN de supervisor para cambiar el medio de pago del pedido #${venta.consecutivo}`}
          onExito={handleAutorizadoConPin}
          onCancelar={() => setPidiendoPin(false)}
        />
      )}
    </>
  )
}
