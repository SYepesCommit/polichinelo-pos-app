import { UseNuevoEspecialProps, UseNuevoEspecialReturn } from '@/types/pos/nuevoEspecialModal.types'
import { useState } from 'react'
    

export const useNuevoEspecial = ({
  categorias,
  categoriaActivaId,
  onClose,
  onGuardarEspecial,
}: UseNuevoEspecialProps): UseNuevoEspecialReturn => {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState<string>('')
  const [categoriaId, setCategoriaId] = useState<string>(
    categoriaActivaId && categoriaActivaId !== 'ESPECIALES_HOY'
      ? categoriaActivaId
      : categorias[0]?.id || ''
  )
  const [ingredienteInput, setIngredienteInput] = useState('')
  const [ingredientes, setIngredientes] = useState<string[]>([])
  const [guardando, setGuardando] = useState(false)

  const handleAddIngrediente = () => {
    if (ingredienteInput.trim()) {
      setIngredientes((prev) => [...prev, ingredienteInput.trim()])
      setIngredienteInput('')
    }
  }

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !precio || Number(precio) <= 0 || !categoriaId) return

    setGuardando(true)
    try {
      await onGuardarEspecial({
        nombre: nombre.trim(),
        precio: Number(precio),
        categoriaId,
        ingredientes,
      })
      onClose()
    } catch (err) {
      console.error('Error al guardar especial:', err)
    } finally {
      setGuardando(false)
    }
  }

  return {
    nombre,
    setNombre,
    precio,
    setPrecio,
    categoriaId,
    setCategoriaId,
    ingredienteInput,
    setIngredienteInput,
    ingredientes,
    guardando,
    handleAddIngrediente,
    handleRemoveIngrediente,
    handleSubmit,
  }
}