import {
  Categoria,
  FiltroEstadoProducto,
  FormularioProductoDTO,
  Producto,
} from '@/types/producto/producto.types'
import { useState, useEffect, useCallback, useMemo } from 'react'

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(false)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | 'TODAS'>('TODAS')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoProducto>('TODOS')

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)

  // Cargar catálogo e historia de categorías desde Electron/Prisma
  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      if (window.electronAPI?.getProductos) {
        const [datosProductos, datosCategorias] = await Promise.all([
          window.electronAPI.getProductos(),
          window.electronAPI.getCategorias ? window.electronAPI.getCategorias() : [],
        ])
        setProductos(datosProductos || [])
        setCategorias(datosCategorias || [])
      }
    } catch (error) {
      console.error('Error al cargar datos del catálogo:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // KPIs calculados sobre el inventario
  const kpis = useMemo(() => {
    const total = productos.length
    const disponibles = productos.filter((p) => p.activo).length
    const agotados = productos.filter((p) => !p.activo).length
    const especiales = productos.filter((p) => p.esEspecial).length
    return { total, disponibles, agotados, especiales }
  }, [productos])

  // Filtro en memoria para búsqueda inmediata por nombre, ingredientes, descripción o categoría
  const productosFiltrados = useMemo(() => {
    const normalizar = (texto: string) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

    const q = normalizar(busqueda)

    return productos.filter((p) => {
      // 1. Filtro por categoría
      const coincideCategoria =
        categoriaSeleccionada === 'TODAS' || p.categoriaId === categoriaSeleccionada
      if (!coincideCategoria) return false

      // 2. Filtro por estado operativo
      if (filtroEstado === 'DISPONIBLES' && !p.activo) return false
      if (filtroEstado === 'AGOTADOS' && p.activo) return false
      if (filtroEstado === 'ESPECIALES' && !p.esEspecial) return false

      // 3. Búsqueda inteligente
      if (!q) return true

      const nombreNormalizado = normalizar(p.nombre)
      if (nombreNormalizado.includes(q)) return true

      if (p.descripcion && normalizar(p.descripcion).includes(q)) return true
      if (p.categoria?.nombre && normalizar(p.categoria.nombre).includes(q)) return true

      if (Array.isArray(p.ingredientes)) {
        const coincideIngrediente = p.ingredientes.some((item) => {
          const nombreIng =
            typeof item === 'string'
              ? item
              : item?.ingrediente?.nombre || item?.nombre || ''
          return typeof nombreIng === 'string' && normalizar(nombreIng).includes(q)
        })
        if (coincideIngrediente) return true
      }

      return false
    })
  }, [productos, busqueda, categoriaSeleccionada, filtroEstado])

  // Abrir modal para crear
  const handleAbrirNuevo = () => {
    setProductoEditar(null)
    setModalAbierto(true)
  }

  // Abrir modal para editar
  const handleAbrirEditar = (producto: Producto) => {
    setProductoEditar(producto)
    setModalAbierto(true)
  }

  // Duplicar / Clonar producto existente
  const handleDuplicarProducto = (producto: Producto) => {
    setProductoEditar({
      ...producto,
      id: 0, // Id falsy para que se guarde como nuevo producto
      nombre: `${producto.nombre} (Copia)`,
    })
    setModalAbierto(true)
  }

  // Cambiar disponibilidad en caja (Switch activo/agotado)
  const handleToggleActivo = async (producto: Producto) => {
    const nuevoEstado = !producto.activo

    // Actualización optimista
    setProductos((prev) =>
      prev.map((p) => (p.id === producto.id ? { ...p, activo: nuevoEstado } : p))
    )

    try {
      if (window.electronAPI?.updateProducto) {
        await window.electronAPI.updateProducto({
          id: producto.id,
          activo: nuevoEstado,
        })
      }
    } catch (error) {
      console.error('Error al cambiar estado activo:', error)
      cargarDatos() // Revertir si hay error
    }
  }

  // Crear o actualizar producto
  const handleGuardarProducto = async (dto: FormularioProductoDTO) => {
    setCargando(true)
    try {
      if (dto.id && dto.id > 0 && window.electronAPI?.updateProducto) {
        await window.electronAPI.updateProducto(dto)
      } else if (window.electronAPI?.createProducto) {
        await window.electronAPI.createProducto(dto)
      }
      setModalAbierto(false)
      setProductoEditar(null)
      await cargarDatos()
    } catch (error) {
      console.error('Error al guardar el producto:', error)
    } finally {
      setCargando(false)
    }
  }

  // Eliminar producto
  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar || !window.electronAPI?.deleteProducto) return
    setCargando(true)
    try {
      await window.electronAPI.deleteProducto(productoAEliminar.id)
      setProductoAEliminar(null)
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
    } finally {
      setCargando(false)
    }
  }

  // Gestión de categorías
  const handleCrearCategoria = async (nombre: string) => {
    if (!window.electronAPI?.createCategoria) return
    await window.electronAPI.createCategoria(nombre)
    await cargarDatos()
  }

  const handleActualizarCategoria = async (id: number, nombre: string) => {
    if (!window.electronAPI?.updateCategoria) return
    await window.electronAPI.updateCategoria({ id, nombre })
    await cargarDatos()
  }

  const handleEliminarCategoria = async (id: number) => {
    if (!window.electronAPI?.deleteCategoria) return
    await window.electronAPI.deleteCategoria(id)
    if (categoriaSeleccionada === id) {
      setCategoriaSeleccionada('TODAS')
    }
    await cargarDatos()
  }

  return {
    productosFiltrados,
    categorias,
    cargando,
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    filtroEstado,
    setFiltroEstado,
    kpis,
    modalAbierto,
    setModalAbierto,
    modalCategoriasAbierto,
    setModalCategoriasAbierto,
    productoEditar,
    productoAEliminar,
    setProductoAEliminar,
    handleAbrirNuevo,
    handleAbrirEditar,
    handleDuplicarProducto,
    handleToggleActivo,
    handleGuardarProducto,
    handleConfirmarEliminar,
    handleCrearCategoria,
    handleActualizarCategoria,
    handleEliminarCategoria,
    recargar: cargarDatos,
  }
}
