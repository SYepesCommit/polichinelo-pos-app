import jsPDF from 'jspdf'
import { DatosComandaCocina } from '../types/pos/posView.types'

function renderizarContenidoTicket(doc: jsPDF, datos: DatosComandaCocina): number {
  let y = 8
  const centro = 40
  const izquierda = 4
  const derecha = 76
  const anchoMaximoTexto = 72

  const SEPARADOR = '------------------------------------'

  const escribirTextoConSalto = (
    texto: string,
    x: number,
    posicionY: number,
    fontSize = 8,
    isBold = false,
    anchoMax = anchoMaximoTexto
  ): number => {
    doc.setFont('courier', isBold ? 'bold' : 'normal')
    doc.setFontSize(fontSize)

    const lineas: string[] = doc.splitTextToSize(texto, anchoMax)
    lineas.forEach((linea) => {
      doc.text(linea, x, posicionY)
      posicionY += fontSize * 0.44
    })

    return posicionY
  }

  // --- ENCABEZADO ---
  doc.setFont('courier', 'bold')
  doc.setFontSize(13)
  doc.text('POLICHINELO POS', centro, y, { align: 'center' })

  y += 4.5
  doc.setFontSize(10.5)
  doc.text(`*** ${datos.tipoPedido} ***`, centro, y, { align: 'center' })

  y += 3.5
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- DATOS DEL PEDIDO (ORDEN, FECHA Y HORA BIEN SEPARADOS) ---
  y += 4.5
  doc.setFont('courier', 'bold')
  doc.setFontSize(9.5)
  doc.text(`ORDEN #${datos.consecutivo}`, izquierda, y)

  doc.setFont('courier', 'normal')
  doc.setFontSize(7.5)
  const fechaLimpia = datos.hora
    ? `${datos.fecha.replace(datos.hora, '').trim()} ${datos.hora}`
    : datos.fecha
  doc.text(fechaLimpia, derecha, y, { align: 'right' })

  if (datos.tipoPedido === 'MESA' && datos.mesa) {
    y += 4
    doc.setFont('courier', 'bold')
    doc.setFontSize(8.5)
    doc.text(`MESA / UBICACION: #${datos.mesa}`, izquierda, y)
  }

  // --- CLIENTE ---
  if (datos.cliente?.nombre) {
    y += 4.5
    y = escribirTextoConSalto(`CLIENTE: ${datos.cliente.nombre}`, izquierda, y, 8, true)

    if (datos.cliente.telefono) {
      y = escribirTextoConSalto(`TEL: ${datos.cliente.telefono}`, izquierda, y, 8, false)
    }

    if (datos.tipoPedido === 'DOMICILIO' && datos.cliente.direccion) {
      y = escribirTextoConSalto(`DIR: ${datos.cliente.direccion}`, izquierda, y, 8, true)

      if (datos.cliente.referenciaDireccion) {
        y = escribirTextoConSalto(
          `REF: ${datos.cliente.referenciaDireccion}`,
          izquierda,
          y,
          8,
          false
        )
      }
    }
  }

  y += 2
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- TABLA DE PRODUCTOS ---
  y += 4
  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('CANT  PRODUCTO', izquierda, y)
  doc.text('SUBTOTAL', derecha, y, { align: 'right' })

  y += 3.5
  doc.setFont('courier', 'normal')
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- ITEMS DE LA COMANDA ---
  y += 4
  datos.items.forEach((item) => {
    doc.setFont('courier', 'bold')
    doc.setFontSize(8.5)

    // 1. Cantidad y Subtotal alineados sin pisarse con el nombre
    const textoCant = `${item.cantidad}x`
    const textoPrecio = `$${Number(item.subtotal || 0).toLocaleString('es-CO')}`

    doc.text(textoCant, izquierda, y)
    doc.text(textoPrecio, derecha, y, { align: 'right' })

    // 2. Nombre del producto en columna central segura (x=13mm, ancho máximo 41mm -> llega hasta x=54mm)
    y = escribirTextoConSalto(item.nombre, 13, y, 8.5, true, 41)

    // --- OBSERVACIONES DEL PRODUCTO ---
    if (item.observaciones && item.observaciones.trim()) {
      const bloques = item.observaciones.split(
        item.observaciones.includes(' | ') ? ' | ' : '\n'
      )

      const listaSin: string[] = []
      const listaAdiciones: string[] = []
      const listaNotas: string[] = []

      bloques.forEach((bloque) => {
        if (!bloque.trim()) return
        const bTrim = bloque.trim()
        const bUpper = bTrim.toUpperCase()

        if (bUpper.startsWith('SIN:') || bUpper.startsWith('SIN ')) {
          const contenido = bTrim.replace(/^SIN:\s*/i, '')
          contenido.split(',').forEach((s) => s.trim() && listaSin.push(s.trim()))
        } else if (bUpper.startsWith('ADICI') || bUpper.startsWith('EXTRA ')) {
          const contenido = bTrim
            .replace(/^ADICI[ÓO]N:\s*/i, '')
            .replace(/^EXTRA:\s*/i, '')
          contenido.split(',').forEach((s) => s.trim() && listaAdiciones.push(s.trim()))
        } else if (bUpper.startsWith('NOTA:')) {
          const contenido = bTrim.replace(/^NOTA:\s*/i, '')
          if (contenido.trim()) listaNotas.push(contenido.trim())
        } else {
          listaNotas.push(bTrim)
        }
      })

      if (listaAdiciones.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.5)
        doc.text('   ADICIONES:', izquierda, y)
        y += 3.2

        listaAdiciones.forEach((adic) => {
          y = escribirTextoConSalto(`    + ${adic}`, izquierda, y, 7.5, true, 66)
        })
      }

      if (listaSin.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.5)
        doc.text('   SIN (QUITAR):', izquierda, y)
        y += 3.2

        listaSin.forEach((ing) => {
          y = escribirTextoConSalto(`    - ${ing}`, izquierda, y, 7.5, true, 66)
        })
      }

      if (listaNotas.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.5)
        doc.text('   NOTA:', izquierda, y)
        y += 3.2

        listaNotas.forEach((nota) => {
          y = escribirTextoConSalto(`    * ${nota}`, izquierda, y, 7.5, false, 66)
        })
      }
    }

    y += 2
  })

  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- TOTALES Y RESUMEN ---
  y += 4
  if (datos.costoDomicilio && datos.costoDomicilio > 0) {
    doc.setFont('courier', 'normal')
    doc.setFontSize(8.5)
    doc.text('SUBTOTAL:', izquierda, y)
    doc.text(`$${Number(datos.subtotal || 0).toLocaleString('es-CO')}`, derecha, y, {
      align: 'right',
    })
    y += 4
    doc.text('DOMICILIO:', izquierda, y)
    doc.text(`$${Number(datos.costoDomicilio || 0).toLocaleString('es-CO')}`, derecha, y, {
      align: 'right',
    })
    y += 4.5
  }

  doc.setFont('courier', 'bold')
  doc.setFontSize(10.5)
  doc.text('TOTAL:', izquierda, y)
  doc.text(`$${Number(datos.total || 0).toLocaleString('es-CO')}`, derecha, y, {
    align: 'right',
  })

  // --- FORMA DE PAGO + BANCO ---
  if (datos.metodoPago) {
    y += 4.5
    const textoPago = datos.bancoNombre
      ? `PAGO: ${datos.metodoPago.toUpperCase()} (${datos.bancoNombre.toUpperCase()})`
      : `PAGO: ${datos.metodoPago.toUpperCase()}`
    y = escribirTextoConSalto(textoPago, izquierda, y, 8, true)
  }

  // --- NOTAS GENERALES AL FINAL ---
  if (datos.observacionesGenerales && datos.observacionesGenerales.trim()) {
    y += 1.5
    y = escribirTextoConSalto(
      `NOTA ORDEN: ${datos.observacionesGenerales.trim()}`,
      izquierda,
      y,
      8,
      true
    )
  }

  y += 4.5
  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('*** COMANDA DE PRODUCCION ***', centro, y, { align: 'center' })

  return y + 7
}

export const generarTicketPDF = (datos: DatosComandaCocina): jsPDF => {
  // 1. Primera pasada en memoria para medir el alto exacto requerido (sin cortar ni desperdiciar papel)
  const docMedicion = new jsPDF({
    unit: 'mm',
    format: [80, 500],
  })
  const altoExacto = Math.max(renderizarContenidoTicket(docMedicion, datos), 95)

  // 2. Segunda pasada con el alto milimétrico exacto del tiquete
  const docFinal = new jsPDF({
    unit: 'mm',
    format: [80, altoExacto],
  })
  renderizarContenidoTicket(docFinal, datos)

  return docFinal
}
