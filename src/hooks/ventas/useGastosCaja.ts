import { useState, useCallback } from 'react'
import { ModoFiltroFecha } from '@/types/ventas/ventas.types'

interface UseGastosCajaParams {
  modoFecha: ModoFiltroFecha
  fechaUnica: string
  fechaInicio: string
  fechaFin: string
  hoyStr: string
  onRecargarArqueo: () => Promise<void>
}

export const useGastosCaja = ({
  modoFecha,
  fechaUnica,
  fechaInicio,
  fechaFin,
  hoyStr,
  onRecargarArqueo,
}: UseGastosCajaParams) => {
  const [modalGastoAbierto, setModalGastoAbierto] = useState(false)
  const [conceptoGasto, setConceptoGasto] = useState('')
  const [montoGasto, setMontoGasto] = useState('')
  const [origenFondosGasto, setOrigenFondosGasto] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO')
  const [totalGastos, setTotalGastos] = useState(0)
  const [totalGastosEfectivo, setTotalGastosEfectivo] = useState(0)
  const [totalGastosTransferencia, setTotalGastosTransferencia] = useState(0)
  const [guardandoGasto, setGuardandoGasto] = useState(false)

  const [modalDetalleGastosAbierto, setModalDetalleGastosAbierto] = useState(false)
  const [listaGastos, setListaGastos] = useState<any[]>([])
  const [cargandoGastos, setCargandoGastos] = useState(false)

  const consultarTotalGastos = useCallback(async (inicio: string, fin: string) => {
    if (window.electronAPI?.getGastosRango) {
      const resGastos = await window.electronAPI.getGastosRango(inicio, fin)
      const total = resGastos.total || 0
      setTotalGastos(total)
      setTotalGastosEfectivo(resGastos.totalEfectivo ?? total)
      setTotalGastosTransferencia(resGastos.totalTransferencia ?? 0)
    }
  }, [])

  const handleGuardarGasto = async (e: React.FormEvent, conceptoOverride?: string) => {
    e.preventDefault()
    const conceptoFinal = (conceptoOverride ?? conceptoGasto).trim()
    if (!conceptoFinal || !montoGasto) return

    setGuardandoGasto(true)
    try {
      if (window.electronAPI?.registrarGasto) {
        const fechaAEnviar = modoFecha === 'UNICA' ? fechaUnica : hoyStr

        await window.electronAPI.registrarGasto({
          concepto: conceptoFinal,
          monto: Number(montoGasto),
          fecha: fechaAEnviar,
          origenFondos: origenFondosGasto,
        })
      }

      setModalGastoAbierto(false)
      setConceptoGasto('')
      setMontoGasto('')
      setOrigenFondosGasto('EFECTIVO')

      await onRecargarArqueo()
    } catch (error) {
      console.error('Error al registrar gasto:', error)
    } finally {
      setGuardandoGasto(false)
    }
  }

  const handleAbrirDetalleGastos = async () => {
    const inicio = modoFecha === 'UNICA' ? fechaUnica : fechaInicio
    const fin = modoFecha === 'UNICA' ? fechaUnica : fechaFin

    setModalDetalleGastosAbierto(true)
    setCargandoGastos(true)
    try {
      if (window.electronAPI?.getGastosListado) {
        const respuesta = await window.electronAPI.getGastosListado(inicio, fin)
        setListaGastos(respuesta || [])
      }
    } catch (error) {
      console.error('Error al consultar lista de gastos:', error)
    } finally {
      setCargandoGastos(false)
    }
  }

  const handleEliminarGasto = async (id: number) => {
    try {
      if (window.electronAPI?.eliminarGasto) {
        const res = await window.electronAPI.eliminarGasto(id)
        if (res.success) {
          setListaGastos((prev) => prev.filter((g) => g.id !== id))
          await onRecargarArqueo()
        }
      }
    } catch (error) {
      console.error('Error eliminando gasto:', error)
    }
  }

  return {
    modalGastoAbierto,
    setModalGastoAbierto,
    conceptoGasto,
    setConceptoGasto,
    montoGasto,
    setMontoGasto,
    origenFondosGasto,
    setOrigenFondosGasto,
    totalGastos,
    totalGastosEfectivo,
    totalGastosTransferencia,
    guardandoGasto,
    modalDetalleGastosAbierto,
    setModalDetalleGastosAbierto,
    listaGastos,
    cargandoGastos,
    consultarTotalGastos,
    handleGuardarGasto,
    handleAbrirDetalleGastos,
    handleEliminarGasto,
  }
}
