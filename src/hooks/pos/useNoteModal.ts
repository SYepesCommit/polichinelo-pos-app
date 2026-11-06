import { AdicionConPrecio, UseNoteModalProps, UseNoteModalReturn } from '@/types/pos/noteModal.types'
import { useState, useEffect } from 'react'

const construirObservacion = (
  ingredientesSin: string[],
  adicionesPagas: AdicionConPrecio[],
  notasGenerales: string
) => {
  const partes: string[] = []

  if (ingredientesSin.length > 0) {
    partes.push(`SIN: ${ingredientesSin.join(', ')}`)
  }

  if (adicionesPagas.length > 0) {
    const itemsAdiciones = adicionesPagas.map(
      (a) => `${a.nombre} (+$${a.precio.toLocaleString('es-CO')})`
    )
    partes.push(`ADICIÓN: ${itemsAdiciones.join(', ')}`)
  }

  if (notasGenerales.trim()) {
    partes.push(`NOTA: ${notasGenerales.trim()}`)
  }

  return partes.join(' | ')
}

export const useNoteModal = ({
  productoAEditar,
  adicionesDisponibles,
  onGuardarObservacion,
  setProductoAEditar,
}: UseNoteModalProps): UseNoteModalReturn => {
  const [ingredientesSin, setIngredientesSin] = useState<string[]>([])
  const [adicionesPAGAS, setAdicionesPAGAS] = useState<AdicionConPrecio[]>([])
  const [notasGenerales, setNotasGenerales] = useState<string>('')

  useEffect(() => {
    if (productoAEditar.observaciones) {
      const partes = productoAEditar.observaciones.split(' | ')
      const sinList: string[] = []
      const pagasList: AdicionConPrecio[] = []
      let notaTexto = ''

      partes.forEach((p) => {
        if (p.startsWith('SIN: ')) {
          sinList.push(...p.replace('SIN: ', '').split(', ').map((s) => s.trim()))
        } else if (p.startsWith('ADICIÓN: ')) {
          const items = p.replace('ADICIÓN: ', '').split(', ').map((a) => a.trim())
          items.forEach((item) => {
            const encontrada = adicionesDisponibles.find((ad) => item.startsWith(ad.nombre))
            if (encontrada) {
              pagasList.push(encontrada)
            }
          })
        } else if (p.startsWith('NOTA: ')) {
          notaTexto = p.replace('NOTA: ', '').trim()
        } else {
          notaTexto = notaTexto ? `${notaTexto}\n${p}` : p
        }
      })

      setIngredientesSin(sinList)
      setAdicionesPAGAS(pagasList)
      setNotasGenerales(notaTexto)
    }
  }, [productoAEditar, adicionesDisponibles])

  const toggleIngredienteSin = (ing: string) => {
    setIngredientesSin((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    )
  }

  const toggleAdicionPaga = (adicion: AdicionConPrecio) => {
    setAdicionesPAGAS((prev) => {
      const existe = prev.some((a) => a.nombre === adicion.nombre)
      return existe
        ? prev.filter((a) => a.nombre !== adicion.nombre)
        : [...prev, adicion]
    })
  }

  const costoAdiciones = adicionesPAGAS.reduce((sum, a) => sum + a.precio, 0)
  const precioBase = productoAEditar.producto.precioBase || productoAEditar.producto.precio
  const precioFinalUnitario = precioBase + costoAdiciones

  const handleGuardar = () => {
    const notaFinal = construirObservacion(ingredientesSin, adicionesPAGAS, notasGenerales)
    onGuardarObservacion(productoAEditar.idTemp, notaFinal, adicionesPAGAS)
    setProductoAEditar(null)
  }

  return {
    ingredientesSin,
    adicionesPAGAS,
    notasGenerales,
    costoAdiciones,
    precioFinalUnitario,
    listaIngredientes: productoAEditar.producto.ingredientes || [],
    setNotasGenerales,
    toggleIngredienteSin,
    toggleAdicionPaga,
    handleGuardar,
  }
}