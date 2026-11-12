import { useState } from 'react'
import { ItemCarrito, Producto, TipoPedido } from '@/types/pos/pos'
import { requiereElegirCarne } from './useNoteModal'

export const usePosCarrito = (tipoPedido: TipoPedido, montoDomicilio: number) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [productoAEditar, setProductoAEditar] = useState<ItemCarrito | null>(null)

  const handleAbrirPersonalizacion = (producto: Producto) => {
    const borradorNuevo: ItemCarrito = {
      idTemp: `temp-draft-${Date.now()}`,
      producto: { ...producto, precioBase: producto.precio },
      cantidad: 1,
      observaciones: '',
    }
    setProductoAEditar(borradorNuevo)
  }

  const agregarProductoRapido = (producto: Producto) => {
    // Si es Arepaburguer o Hamburguesa (Descarada, Ranchera, etc.), abrir modal para elegir carne y salsas
    if (requiereElegirCarne(producto)) {
      handleAbrirPersonalizacion(producto)
      return
    }

    setCarrito((prev) => {
      const existeSinNotas = prev.find(
        (item) => item.producto.id === producto.id && !item.observaciones?.trim()
      )
      if (existeSinNotas) {
        return prev.map((item) =>
          item.idTemp === existeSinNotas.idTemp
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          idTemp: `${producto.id}-${Date.now()}`,
          producto,
          cantidad: 1,
          observaciones: '',
        },
      ]
    })
  }

  const handleAgregarItemLibre = (nombreConcepto: string, precio: number) => {
    const itemLibre: ItemCarrito = {
      idTemp: `libre-${Date.now()}`,
      producto: {
        id: 'item-libre',
        nombre: `[Varios] ${nombreConcepto}`,
        precio,
        precioBase: precio,
      },
      cantidad: 1,
      observaciones: 'Ítem cobrado directamente',
    }
    setCarrito((prev) => [...prev, itemLibre])
  }

  const guardarObservacion = (
    idTemp: string,
    nuevasNotas: string,
    adicionesPrecios: { nombre: string; precio: number }[]
  ) => {
    const notasLimpias = nuevasNotas.trim()
    const extraAdiciones = adicionesPrecios.reduce((sum, a) => sum + a.precio, 0)
    setCarrito((prev) => {
      const existeEnCarrito = prev.some((item) => item.idTemp === idTemp)
      if (existeEnCarrito) {
        return prev.map((item) => {
          if (item.idTemp === idTemp) {
            const precioBase = item.producto.precioBase ?? item.producto.precio
            return {
              ...item,
              observaciones: notasLimpias,
              producto: {
                ...item.producto,
                precioBase,
                precio: precioBase + extraAdiciones,
              },
            }
          }
          return item
        })
      } else {
        if (!productoAEditar) return prev
        const precioBase =
          productoAEditar.producto.precioBase ?? productoAEditar.producto.precio
        const precioFinal = precioBase + extraAdiciones

        // Si ya existe en el carrito el mismo producto con idéntica personalización, sumar +1
        const itemIdentico = prev.find(
          (item) =>
            item.producto.id === productoAEditar.producto.id &&
            (item.observaciones || '').trim() === notasLimpias &&
            item.producto.precio === precioFinal
        )
        if (itemIdentico) {
          return prev.map((item) =>
            item.idTemp === itemIdentico.idTemp
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        }

        const itemAInsertar: ItemCarrito = {
          ...productoAEditar,
          idTemp: `${productoAEditar.producto.id}-${Date.now()}`,
          observaciones: notasLimpias,
          producto: {
            ...productoAEditar.producto,
            precioBase,
            precio: precioFinal,
          },
        }
        return [...prev, itemAInsertar]
      }
    })
    setProductoAEditar(null)
  }

  const cambiarCantidad = (idTemp: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.idTemp === idTemp) {
            const nuevaCantidad = item.cantidad + delta
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null
          }
          return item
        })
        .filter(Boolean) as ItemCarrito[]
    )
  }

  const eliminarItem = (idTemp: string) => {
    setCarrito((prev) => prev.filter((item) => item.idTemp !== idTemp))
  }

  const subtotalCarrito = carrito.reduce(
    (sum, item) => sum + (item.producto.precio || 0) * item.cantidad,
    0
  )
  const total = subtotalCarrito + (tipoPedido === 'DOMICILIO' ? montoDomicilio : 0)

  return {
    carrito,
    setCarrito,
    productoAEditar,
    setProductoAEditar,
    subtotalCarrito,
    total,
    agregarProductoRapido,
    handleAgregarItemLibre,
    handleAbrirPersonalizacion,
    guardarObservacion,
    cambiarCantidad,
    eliminarItem,
  }
}
