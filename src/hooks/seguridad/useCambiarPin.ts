import { useState } from 'react'
import { PasoPin } from '@/types/seguridad/seguridad.types'

export const useCambiarPin = (onCerrar: () => void) => {
  const [paso, setPaso] = useState<PasoPin>('ACTUAL')
  const [pinActual, setPinActual] = useState('')
  const [pinNuevo, setPinNuevo] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)

  const procesarPasoCompleto = async (valor4Digitos: string) => {
    if (paso === 'ACTUAL') {
      setProcesando(true)
      const esValido = window.electronAPI?.verificarPin
        ? await window.electronAPI.verificarPin(valor4Digitos)
        : valor4Digitos === '1234'
      setProcesando(false)

      if (!esValido) {
        setErrorMsg('El PIN actual ingresado es incorrecto')
        setTimeout(() => setPinInput(''), 600)
        return
      }

      setPinActual(valor4Digitos)
      setPinInput('')
      setPaso('NUEVO')
      return
    }

    if (paso === 'NUEVO') {
      setPinNuevo(valor4Digitos)
      setPinInput('')
      setPaso('CONFIRMAR')
      return
    }

    if (paso === 'CONFIRMAR') {
      if (valor4Digitos !== pinNuevo) {
        setErrorMsg('Los PIN nuevos no coinciden. Intenta de nuevo.')
        setTimeout(() => {
          setPinNuevo('')
          setPinInput('')
          setPaso('NUEVO')
        }, 900)
        return
      }

      setProcesando(true)
      const res = await window.electronAPI.cambiarPin({
        pinActual,
        pinNuevo: valor4Digitos,
      })
      setProcesando(false)

      if (res.ok) {
        setPaso('EXITO')
        setTimeout(() => {
          onCerrar()
        }, 1400)
      } else {
        setErrorMsg(res.error || 'No se pudo actualizar el PIN')
        setTimeout(() => setPinInput(''), 600)
      }
    }
  }

  const handleTecla = async (digito: string) => {
    if (procesando || paso === 'EXITO') return
    if (errorMsg) setErrorMsg(null)

    if (pinInput.length < 4) {
      const siguiente = pinInput + digito
      setPinInput(siguiente)

      if (siguiente.length === 4) {
        await procesarPasoCompleto(siguiente)
      }
    }
  }

  const handleBorrar = () => {
    if (procesando || paso === 'EXITO') return
    if (errorMsg) setErrorMsg(null)
    setPinInput((prev) => prev.slice(0, -1))
  }

  const getTextosPaso = () => {
    switch (paso) {
      case 'ACTUAL':
        return {
          titulo: 'Cambiar PIN Supervisor',
          subtitulo: 'Ingresa el PIN actual de 4 dígitos',
        }
      case 'NUEVO':
        return {
          titulo: 'Nuevo PIN Supervisor',
          subtitulo: 'Digita el nuevo PIN de 4 dígitos',
        }
      case 'CONFIRMAR':
        return {
          titulo: 'Confirmar Nuevo PIN',
          subtitulo: 'Repite el nuevo PIN para confirmar',
        }
      case 'EXITO':
        return {
          titulo: '¡PIN Actualizado!',
          subtitulo: 'El nuevo PIN de supervisor ha quedado guardado.',
        }
    }
  }

  return {
    paso,
    pinInput,
    errorMsg,
    procesando,
    handleTecla,
    handleBorrar,
    ...getTextosPaso(),
  }
}
