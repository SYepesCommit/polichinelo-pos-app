import { AdicionConPrecio, UseNoteModalProps, UseNoteModalReturn } from '@/types/pos/noteModal.types'
import { useState, useEffect } from 'react'

export const OPCIONES_CARNE = ['Pollo', 'Tocineta', 'Churrasco'] as const
export const OPCIONES_SALSAS = ['Rosada', 'Piña', 'Tártara', 'BBQ', 'Chimichurri'] as const

export function requiereElegirCarne(producto: {
  nombre?: string
  ingredientes?: string[]
}): boolean {
  const n = (producto.nombre || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  // Excluir perros calientes, salchipapas o porciones (ej. Perro Ranchero usa salchicha ranchera)
  if (
    n.includes('perro') ||
    n.includes('perra') ||
    n.includes('salchipapa') ||
    n.includes('chori') ||
    n.includes('porcion')
  ) {
    return false
  }

  if (
    n.includes('arepaburg') ||
    n.includes('descarada') ||
    n.includes('ranchera') ||
    n.includes('hamburg') ||
    n.includes('burger') ||
    n.includes('burguer')
  ) {
    return true
  }

  if (
    Array.isArray(producto.ingredientes) &&
    producto.ingredientes.some((i) => i.toLowerCase().includes('elegir carne'))
  ) {
    return true
  }

  return false
}

export function detectarCarnePorDefecto(nombreProducto?: string): string {
  const n = (nombreProducto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (n.includes('de pollo')) return 'Pollo'
  if (n.includes('de tocineta')) return 'Tocineta'
  if (n.includes('de churrasco')) return 'Churrasco'
  return ''
}

const construirObservacion = (
  carneSeleccionada: string,
  salsasSeleccionadas: string[],
  ingredientesSin: string[],
  adicionesPagas: AdicionConPrecio[],
  notasGenerales: string
) => {
  const partes: string[] = []

  if (carneSeleccionada.trim()) {
    partes.push(`CARNE: ${carneSeleccionada.trim()}`)
  }

  if (salsasSeleccionadas.length > 0) {
    partes.push(`SALSAS: ${salsasSeleccionadas.join(', ')}`)
  }

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
  const requiereCarne = requiereElegirCarne(productoAEditar.producto)
  const [carneSeleccionada, setCarneSeleccionada] = useState<string>(() =>
    requiereCarne ? detectarCarnePorDefecto(productoAEditar.producto.nombre) : ''
  )
  const [salsasSeleccionadas, setSalsasSeleccionadas] = useState<string[]>([])
  const [ingredientesSin, setIngredientesSin] = useState<string[]>([])
  const [adicionesPAGAS, setAdicionesPAGAS] = useState<AdicionConPrecio[]>([])
  const [notasGenerales, setNotasGenerales] = useState<string>('')

  useEffect(() => {
    const reqCarne = requiereElegirCarne(productoAEditar.producto)
    let carneInicial = reqCarne ? detectarCarnePorDefecto(productoAEditar.producto.nombre) : ''
    const salsasList: string[] = []
    const sinList: string[] = []
    const pagasList: AdicionConPrecio[] = []
    let notaTexto = ''

    if (productoAEditar.observaciones) {
      const partes = productoAEditar.observaciones.split(' | ')

      partes.forEach((p) => {
        const pTrim = p.trim()
        if (pTrim.toUpperCase().startsWith('CARNE:')) {
          carneInicial = pTrim.replace(/^CARNE:\s*/i, '').trim()
        } else if (pTrim.toUpperCase().startsWith('SALSAS:')) {
          const items = pTrim
            .replace(/^SALSAS:\s*/i, '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          salsasList.push(...items)
        } else if (pTrim.startsWith('SIN: ')) {
          sinList.push(
            ...pTrim
              .replace('SIN: ', '')
              .split(', ')
              .map((s) => s.trim())
          )
        } else if (pTrim.startsWith('ADICIÓN: ') || pTrim.startsWith('ADICION: ')) {
          const items = pTrim
            .replace(/^ADICI[ÓO]N:\s*/i, '')
            .split(', ')
            .map((a) => a.trim())
          items.forEach((item) => {
            const encontrada = adicionesDisponibles.find((ad) => item.startsWith(ad.nombre))
            if (encontrada) {
              pagasList.push(encontrada)
            }
          })
        } else if (pTrim.startsWith('NOTA: ')) {
          notaTexto = pTrim.replace('NOTA: ', '').trim()
        } else if (pTrim) {
          notaTexto = notaTexto ? `${notaTexto}\n${pTrim}` : pTrim
        }
      })
    }

    setCarneSeleccionada(carneInicial)
    setSalsasSeleccionadas(salsasList)
    setIngredientesSin(sinList)
    setAdicionesPAGAS(pagasList)
    setNotasGenerales(notaTexto)
  }, [productoAEditar, adicionesDisponibles])

  const toggleSalsa = (salsa: string) => {
    setSalsasSeleccionadas((prev) => {
      const sinFlag = prev.filter((s) => s !== 'SIN SALSAS')
      return sinFlag.includes(salsa)
        ? sinFlag.filter((s) => s !== salsa)
        : [...sinFlag, salsa]
    })
  }

  const seleccionarTodasLasSalsas = () => {
    setSalsasSeleccionadas((prev) => {
      const tieneTodas = OPCIONES_SALSAS.every((s) => prev.includes(s))
      return tieneTodas ? [] : [...OPCIONES_SALSAS]
    })
  }

  const seleccionarSinSalsas = () => {
    setSalsasSeleccionadas((prev) =>
      prev.includes('SIN SALSAS') ? [] : ['SIN SALSAS']
    )
  }

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
    if (requiereCarne && !carneSeleccionada.trim()) return
    const notaFinal = construirObservacion(
      carneSeleccionada,
      salsasSeleccionadas,
      ingredientesSin,
      adicionesPAGAS,
      notasGenerales
    )
    onGuardarObservacion(productoAEditar.idTemp, notaFinal, adicionesPAGAS)
    setProductoAEditar(null)
  }

  return {
    requiereCarne,
    carneSeleccionada,
    setCarneSeleccionada,
    salsasSeleccionadas,
    toggleSalsa,
    seleccionarTodasLasSalsas,
    seleccionarSinSalsas,
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
