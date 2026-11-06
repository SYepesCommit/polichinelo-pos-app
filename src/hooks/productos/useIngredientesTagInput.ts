import { useState, useEffect, useRef } from 'react'
import { IngredientesTagInputProps } from '@/types/producto/producto.types'

export const useIngredientesTagInput = ({
  ingredientes,
  onAgregar,
  onRemover,
}: IngredientesTagInputProps) => {
  const [inputTexto, setInputTexto] = useState('')
  const [sugerenciasBD, setSugerenciasBD] = useState<string[]>([])
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1)

  const contenedorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar ingredientes existentes en la base de datos para autocompletar
  useEffect(() => {
    const cargarSugerencias = async () => {
      try {
        if (window.electronAPI?.getIngredientes) {
          const resultado = await window.electronAPI.getIngredientes()
          if (Array.isArray(resultado)) {
            const nombres = resultado
              .map((item) => item.nombre)
              .filter(
                (nombre): nombre is string =>
                  typeof nombre === 'string' && nombre.trim().length > 0
              )
            setSugerenciasBD(nombres)
          }
        }
      } catch (error) {
        console.error('Error cargando sugerencias de ingredientes:', error)
      }
    }
    cargarSugerencias()
  }, [])

  // Cerrar dropdown si se hace clic fuera del componente
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setMostrarDropdown(false)
        setIndiceSeleccionado(-1)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  // Filtrar sugerencias de la base de datos
  const sugerenciasFiltradas = sugerenciasBD.filter((sug) => {
    const yaEstaAgregado = ingredientes.some(
      (ing) => ing.toLowerCase() === sug.toLowerCase()
    )
    if (yaEstaAgregado) return false
    if (!inputTexto.trim()) return true
    return sug.toLowerCase().includes(inputTexto.trim().toLowerCase())
  })

  // Sugerencias rápidas (primeros 5 que no estén seleccionados)
  const sugerenciasRapidas = sugerenciasBD
    .filter((sug) => !ingredientes.some((ing) => ing.toLowerCase() === sug.toLowerCase()))
    .slice(0, 5)

  const handleAgregarActual = (texto?: string) => {
    const valor = (texto !== undefined ? texto : inputTexto).trim()
    if (!valor) return

    onAgregar(valor)
    setInputTexto('')
    setIndiceSeleccionado(-1)
    setMostrarDropdown(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      if (
        mostrarDropdown &&
        indiceSeleccionado >= 0 &&
        indiceSeleccionado < sugerenciasFiltradas.length
      ) {
        handleAgregarActual(sugerenciasFiltradas[indiceSeleccionado])
      } else {
        handleAgregarActual()
      }
      return
    }

    if (e.key === 'Backspace' && inputTexto === '' && ingredientes.length > 0) {
      onRemover(ingredientes[ingredientes.length - 1])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!mostrarDropdown) {
        setMostrarDropdown(true)
        setIndiceSeleccionado(0)
      } else {
        setIndiceSeleccionado((prev) =>
          prev < sugerenciasFiltradas.length - 1 ? prev + 1 : prev
        )
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (mostrarDropdown) {
        setIndiceSeleccionado((prev) => (prev > 0 ? prev - 1 : -1))
      }
      return
    }

    if (e.key === 'Escape') {
      setMostrarDropdown(false)
      setIndiceSeleccionado(-1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const textoPegado = e.clipboardData.getData('text')
    if (textoPegado && textoPegado.includes(',')) {
      e.preventDefault()
      onAgregar(textoPegado)
      setInputTexto('')
    }
  }

  return {
    inputTexto,
    setInputTexto,
    sugerenciasBD,
    mostrarDropdown,
    setMostrarDropdown,
    indiceSeleccionado,
    setIndiceSeleccionado,
    contenedorRef,
    inputRef,
    sugerenciasFiltradas,
    sugerenciasRapidas,
    handleAgregarActual,
    handleKeyDown,
    handlePaste,
  }
}
