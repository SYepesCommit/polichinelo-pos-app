import { useState, useEffect } from 'react'
import { ProductoModalProps } from '@/types/producto/producto.types'

export const useProductoModal = ({
  productoEditar,
  categorias,
  onGuardar,
  onClose,
}: ProductoModalProps) => {
  const [nombre, setNombre] = useState('')
  const [ingredientes, setIngredientes] = useState<string[]>([])
  const [precioVenta, setPrecioVenta] = useState('')
  const [costoBase, setCostoBase] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [esEspecial, setEsEspecial] = useState(false)
  const [activo, setActivo] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (productoEditar) {
      setNombre(productoEditar.nombre || '')

      if (Array.isArray(productoEditar.ingredientes)) {
        const nombres = productoEditar.ingredientes
          .map((item) => {
            if (typeof item === 'string') return item
            if (item?.ingrediente?.nombre) return item.ingrediente.nombre
            if (item?.nombre) return item.nombre
            return null
          })
          .filter((n): n is string => Boolean(n) && typeof n === 'string' && n.trim().length > 0)

        setIngredientes(Array.from(new Set(nombres)))
      } else if (typeof productoEditar.ingredientes === 'string') {
        const nombres = productoEditar.ingredientes
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i.length > 0)
        setIngredientes(Array.from(new Set(nombres)))
      } else {
        setIngredientes([])
      }

      setPrecioVenta(String(productoEditar.precioVenta || ''))
      setCostoBase(String(productoEditar.costoBase || 0))
      setCategoriaId(
        typeof productoEditar.categoriaId === 'number' ? productoEditar.categoriaId : ''
      )
      setImagenUrl(productoEditar.imagenUrl || '')
      setEsEspecial(productoEditar.esEspecial || false)
      setActivo(productoEditar.activo ?? true)
    } else {
      setNombre('')
      setIngredientes([])
      setPrecioVenta('')
      setCostoBase('0')
      setCategoriaId(categorias[0]?.id != null ? Number(categorias[0].id) : '')
      setImagenUrl('')
      setEsEspecial(false)
      setActivo(true)
    }
  }, [productoEditar, categorias])

  const agregarIngrediente = (nombreIng: string) => {
    const partes = nombreIng
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    setIngredientes((prev) => {
      const nuevo = [...prev]
      for (const item of partes) {
        if (!nuevo.some((existente) => existente.toLowerCase() === item.toLowerCase())) {
          nuevo.push(item)
        }
      }
      return nuevo
    })
  }

  const removerIngrediente = (nombreIng: string) => {
    setIngredientes((prev) =>
      prev.filter((item) => item.toLowerCase() !== nombreIng.toLowerCase())
    )
  }

  const handleSeleccionarImagen = async () => {
    if (window.electronAPI?.seleccionarImagenProducto) {
      const ruta = await window.electronAPI.seleccionarImagenProducto()
      if (ruta) setImagenUrl(ruta)
    }
  }

  const handleLimpiarImagen = () => {
    setImagenUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !precioVenta) return

    setGuardando(true)
    try {
      await onGuardar({
        id: productoEditar?.id,
        nombre: nombre.trim(),
        ingredientes,
        precioVenta: Number(precioVenta),
        costoBase: Number(costoBase) || 0,
        categoriaId: categoriaId ? Number(categoriaId) : null,
        imagenUrl: imagenUrl.trim() || null,
        esEspecial,
        activo,
      })
      onClose()
    } catch (error) {
      console.error('Error al guardar el producto:', error)
    } finally {
      setGuardando(false)
    }
  }

  // Cálculos de rentabilidad en tiempo real
  const pv = Number(precioVenta) || 0
  const cb = Number(costoBase) || 0
  const ganancia = pv - cb
  const margenPct = pv > 0 ? (ganancia / pv) * 100 : 0
  const esPerdida = pv > 0 && cb >= pv

  return {
    nombre,
    setNombre,
    ingredientes,
    setIngredientes,
    agregarIngrediente,
    removerIngrediente,
    precioVenta,
    setPrecioVenta,
    costoBase,
    setCostoBase,
    categoriaId,
    setCategoriaId,
    imagenUrl,
    esEspecial,
    setEsEspecial,
    activo,
    setActivo,
    guardando,
    pv,
    cb,
    ganancia,
    margenPct,
    esPerdida,
    handleSeleccionarImagen,
    handleLimpiarImagen,
    handleSubmit,
  }
}
