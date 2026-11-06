import { useState } from 'react'

export const usePinSupervisor = (onExito: () => void) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [verificando, setVerificando] = useState(false)

  const validarPinEnBackend = async (pinAProbar: string) => {
    try {
      setVerificando(true)
      const esValido = window.electronAPI?.verificarPin
        ? await window.electronAPI.verificarPin(pinAProbar)
        : pinAProbar === '1234'

      if (esValido) {
        onExito()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setVerificando(false)
        }, 600)
      }
    } catch (err) {
      console.error('Error al verificar PIN:', err)
      setError(true)
      setTimeout(() => {
        setPin('')
        setVerificando(false)
      }, 600)
    }
  }

  const handleTecla = (digito: string) => {
    if (verificando) return
    if (error) setError(false)
    if (pin.length < 4) {
      const nuevoPin = pin + digito
      setPin(nuevoPin)
      if (nuevoPin.length === 4) {
        validarPinEnBackend(nuevoPin)
      }
    }
  }

  const handleBorrar = () => {
    if (verificando) return
    if (error) setError(false)
    setPin((prev) => prev.slice(0, -1))
  }

  return {
    pin,
    error,
    verificando,
    handleTecla,
    handleBorrar,
  }
}
