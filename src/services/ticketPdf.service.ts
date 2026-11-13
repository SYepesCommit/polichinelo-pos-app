import jsPDF from 'jspdf'
import { DatosComandaCocina } from '../types/pos/posView.types'
import { DatosLiquidacionDomicilios } from '../types/ventas/ventas.types'

function formatearTelefono(tel?: string): string {
  if (!tel) return ''
  const limpio = tel.replace(/\D/g, '')
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`
  }
  return tel.trim()
}

function renderizarContenidoTicket(doc: jsPDF, datos: DatosComandaCocina): number {
  let y = 11
  const centro = 40
  const izquierda = 2
  const derecha = 78
  const anchoMaximoTexto = 76

  const dibujarLinea = (posY: number, doble = false): number => {
    const lineaY = posY + 2
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(doble ? 0.7 : 0.4)
    doc.line(izquierda, lineaY, derecha, lineaY)
    if (doble) {
      doc.line(izquierda, lineaY + 1.4, derecha, lineaY + 1.4)
      return lineaY + 4.5
    }
    return lineaY + 3.5
  }

  const escribirTextoConSalto = (
    texto: string,
    x: number,
    posicionY: number,
    fontSize = 14,
    isBold = false,
    anchoMax = anchoMaximoTexto
  ): number => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setFontSize(fontSize)

    const lineas: string[] = doc.splitTextToSize(texto, anchoMax)
    lineas.forEach((linea) => {
      doc.text(linea, x, posicionY)
      posicionY += fontSize * 0.48
    })

    return posicionY
  }

  // Escribe "ETIQUETA: " en negrilla (subtítulo) y el contenido en texto normal
  const escribirSubtituloYValor = (
    etiqueta: string,
    valor: string,
    x: number,
    posicionY: number,
    fontSize = 12,
    anchoMax = anchoMaximoTexto
  ): number => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(fontSize)
    const etiquetaConEspacio = `${etiqueta} `
    const anchoEtiqueta = doc.getTextWidth(etiquetaConEspacio)

    doc.setFont('helvetica', 'normal')
    const anchoDisponiblePrimeraLinea = Math.max(20, anchoMax - anchoEtiqueta)
    const lineasValor: string[] = doc.splitTextToSize(valor, anchoDisponiblePrimeraLinea)

    // Primera línea: etiqueta en negrilla + primera parte del valor en normal
    doc.setFont('helvetica', 'bold')
    doc.text(etiquetaConEspacio, x, posicionY)
    doc.setFont('helvetica', 'normal')
    if (lineasValor.length > 0) {
      doc.text(lineasValor[0], x + anchoEtiqueta, posicionY)
    }
    posicionY += fontSize * 0.48

    // Si hay más líneas de valor, las ajustamos al ancho completo
    if (lineasValor.length > 1) {
      const restoTexto = lineasValor.slice(1).join(' ')
      const lineasResto: string[] = doc.splitTextToSize(restoTexto, anchoMax)
      lineasResto.forEach((linea) => {
        doc.text(linea, x, posicionY)
        posicionY += fontSize * 0.48
      })
    }

    return posicionY
  }

  // --- 1. ENCABEZADO SEGÚN EL TIPO DE ORDEN (TÍTULOS EN NEGRILLA) ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('POLICHINELO POS', centro, y, { align: 'center' })

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const tituloTipo =
    datos.tipoPedido === 'DOMICILIO'
      ? 'DESPACHO A DOMICILIO'
      : datos.tipoPedido === 'LLEVAR'
      ? 'EMPACAR PARA LLEVAR'
      : 'SERVICIO EN MESA'
  doc.text(tituloTipo, centro, y, { align: 'center' })

  y += 2.5
  y = dibujarLinea(y, true)

  // --- 2. ORDEN, FECHA Y HORA ---
  y += 4.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.text(`ORDEN #${datos.consecutivo}`, izquierda, y)

  y += 5.2
  const fechaLimpia = datos.hora
    ? `${datos.fecha.replace(datos.hora, '').trim()} ${datos.hora}`
    : datos.fecha
  escribirSubtituloYValor('FECHA:', fechaLimpia, izquierda, y, 10)
  y += 2

  y = dibujarLinea(y)

  // --- 3. DATOS DEL CLIENTE Y ENTREGA (SUBTÍTULOS EN NEGRILLA, DATOS EN NORMAL) ---
  const nombreMostrar =
    datos.cliente?.nombre?.trim() || datos.detallesDestino?.trim() || 'Cliente'

  y += 4.8
  y = escribirSubtituloYValor('CLIENTE:', nombreMostrar.toUpperCase(), izquierda, y, 11.5)

  if (datos.tipoPedido === 'DOMICILIO') {
    const telFormateado = formatearTelefono(datos.cliente?.telefono)
    if (telFormateado) {
      y += 1.5
      y = escribirSubtituloYValor('TEL:', telFormateado, izquierda, y, 11.5)
    }

    const dirTexto = datos.cliente?.direccion?.trim()
    if (dirTexto) {
      y += 1.5
      y = escribirSubtituloYValor('DIR:', dirTexto.toUpperCase(), izquierda, y, 12)
    }

    const refTexto = datos.cliente?.referenciaDireccion?.trim()
    if (refTexto) {
      y += 1.5
      y = escribirSubtituloYValor('REF:', refTexto, izquierda, y, 11)
    }
  }

  y += 1
  y = dibujarLinea(y)

  // --- 4. TABLA DE PRODUCTOS (SUBTÍTULOS DE COLUMNA EN NEGRILLA) ---
  y += 4.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CANT  PRODUCTO', izquierda, y)
  doc.text('SUBTOTAL', derecha, y, { align: 'right' })

  y += 2
  y = dibujarLinea(y)

  // --- 5. ÍTEMS DE LA COMANDA Y ALERTAS DE COCINA (SIN NEGRILLA) ---
  y += 6.5
  datos.items.forEach((item) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(15.5)
    const textoPrecio = `$${Number(item.subtotal || 0).toLocaleString('es-CO')}`
    doc.text(textoPrecio, derecha, y, { align: 'right' })

    y = escribirTextoConSalto(
      `${item.cantidad}x ${item.nombre}`,
      izquierda,
      y,
      16.5,
      false,
      51
    )

    if (item.observaciones && item.observaciones.trim()) {
      const bloques = item.observaciones.split(
        item.observaciones.includes(' | ') ? ' | ' : '\n'
      )

      let carneElegida = ''
      const listaSalsas: string[] = []
      const listaSin: string[] = []
      const listaAdiciones: string[] = []
      const listaNotas: string[] = []

      bloques.forEach((bloque) => {
        if (!bloque.trim()) return
        const bTrim = bloque.trim()
        const bUpper = bTrim.toUpperCase()

        if (bUpper.startsWith('CARNE:')) {
          carneElegida = bTrim.replace(/^CARNE:\s*/i, '').trim()
        } else if (bUpper.startsWith('SALSAS:') || bUpper.startsWith('SALSA:')) {
          const contenido = bTrim.replace(/^SALSAS?:\s*/i, '')
          contenido.split(',').forEach((s) => s.trim() && listaSalsas.push(s.trim()))
        } else if (bUpper.startsWith('SIN:') || bUpper.startsWith('SIN ')) {
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

      if (carneElegida) {
        y += 2
        y = escribirTextoConSalto(
          `  • CARNE: ${carneElegida.toUpperCase()}`,
          izquierda,
          y,
          15,
          false,
          74
        )
      }

      if (listaSalsas.length > 0) {
        y += 2
        y = escribirTextoConSalto(
          `  • SALSAS: ${listaSalsas.join(', ').toUpperCase()}`,
          izquierda,
          y,
          15,
          false,
          74
        )
      }

      if (listaSin.length > 0) {
        y += 2.2
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(15)
        doc.text('  [!] SIN:', izquierda, y)
        y += 7.2

        listaSin.forEach((ing) => {
          y = escribirTextoConSalto(`    - ${ing.toUpperCase()}`, izquierda, y, 15, false, 74)
        })
      }

      if (listaAdiciones.length > 0) {
        y += 2.2
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(15)
        doc.text('  [+] ADICIONES:', izquierda, y)
        y += 7.2

        listaAdiciones.forEach((adic) => {
          y = escribirTextoConSalto(`    + ${adic}`, izquierda, y, 15, false, 74)
        })
      }

      if (listaNotas.length > 0) {
        y += 2.2
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(15)
        doc.text('  [*] NOTA PLATO:', izquierda, y)
        y += 7.2

        listaNotas.forEach((nota) => {
          y = escribirTextoConSalto(`    * ${nota}`, izquierda, y, 15, false, 74)
        })
      }
    }

    y += 5.5
  })

  y = dibujarLinea(y, true)

  // --- 6. TOTALES Y MEDIO DE PAGO (FOOTER DE DINERO MÁS COMPACTO) ---
  y += 4.5
  if (datos.costoDomicilio && datos.costoDomicilio > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text('SUBTOTAL:', izquierda, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`$${Number(datos.subtotal || 0).toLocaleString('es-CO')}`, derecha, y, {
      align: 'right',
    })
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text('DOMICILIO:', izquierda, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`$${Number(datos.costoDomicilio || 0).toLocaleString('es-CO')}`, derecha, y, {
      align: 'right',
    })
    y += 5.8
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('TOTAL:', izquierda, y)
  doc.text(`$${Number(datos.total || 0).toLocaleString('es-CO')}`, derecha, y, {
    align: 'right',
  })

  // --- 7. FORMA DE PAGO Y VUELTOS ---
  const esMixto = Boolean(
    (Array.isArray(datos.pagos) && datos.pagos.length > 1) ||
      datos.metodoPago?.toUpperCase().includes('MIXTO')
  )

  if (esMixto && Array.isArray(datos.pagos) && datos.pagos.length > 0) {
    const pagoEfvo = datos.pagos.find((p) =>
      p.metodoPago?.toUpperCase().includes('EFECTIVO')
    )
    const montoEfvoParte = Number(pagoEfvo?.monto || 0)
    y += 5.5

    if (datos.tipoPedido === 'DOMICILIO' && montoEfvoParte > 0) {
      y = escribirSubtituloYValor(
        'MIXTO - COBRAR EFECTIVO:',
        `$${montoEfvoParte.toLocaleString('es-CO')}`,
        izquierda,
        y,
        10.5
      )
      y += 1.2
    }

    y = escribirSubtituloYValor('PAGO:', 'MIXTO (EFECTIVO + TRANSF.)', izquierda, y, 10.5)
    y += 1

    datos.pagos.forEach((p) => {
      const esP_Efvo = p.metodoPago?.toUpperCase().includes('EFECTIVO')
      const etiqueta = esP_Efvo
        ? '  • EFECTIVO:'
        : `  • TRANSF.${p.bancoNombre ? ` (${p.bancoNombre.toUpperCase()})` : ''}:`
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(etiqueta, izquierda, y)
      doc.text(`$${Number(p.monto || 0).toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 4.8
    })

    if (montoEfvoParte > 0) {
      const montoRecibidoEfectivo =
        datos.montoRecibido && Number(datos.montoRecibido) > 0
          ? Number(datos.montoRecibido)
          : montoEfvoParte
      const cambioEfectivo =
        datos.cambio !== undefined && datos.cambio !== null
          ? Number(datos.cambio)
          : Math.max(0, montoRecibidoEfectivo - montoEfvoParte)

      y += 1.2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.text('PAGA EFECTIVO CON:', izquierda, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${montoRecibidoEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('CAMBIO A DEVOLVER:', izquierda, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${cambioEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 2
    }
  } else if (datos.metodoPago) {
    const esEfectivo = datos.metodoPago.toUpperCase().includes('EFECTIVO')
    y += 5.5

    if (datos.tipoPedido === 'DOMICILIO' && esEfectivo) {
      y = escribirSubtituloYValor(
        'COBRAR EN EFECTIVO:',
        `$${Number(datos.total || 0).toLocaleString('es-CO')}`,
        izquierda,
        y,
        10.5
      )
    } else {
      const textoPago = datos.bancoNombre
        ? `${datos.metodoPago.toUpperCase()} (${datos.bancoNombre.toUpperCase()})`
        : datos.metodoPago.toUpperCase()
      y = escribirSubtituloYValor('PAGO:', textoPago, izquierda, y, 10.5)
    }

    if (esEfectivo) {
      const montoRecibidoEfectivo =
        datos.montoRecibido && Number(datos.montoRecibido) > 0
          ? Number(datos.montoRecibido)
          : Number(datos.total || 0)
      const cambioEfectivo =
        datos.cambio !== undefined && datos.cambio !== null
          ? Number(datos.cambio)
          : Math.max(0, montoRecibidoEfectivo - Number(datos.total || 0))

      y += 1.2
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.text('PAGA CON (EFECTIVO):', izquierda, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${montoRecibidoEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('CAMBIO A DEVOLVER:', izquierda, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${cambioEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 2
    }
  }

  // --- 8. NOTAS GENERALES DE LA ORDEN ---
  if (datos.observacionesGenerales && datos.observacionesGenerales.trim()) {
    y += 2.5
    y = dibujarLinea(y, true)
    y += 4.8
    y = escribirSubtituloYValor(
      'NOTA ORDEN:',
      datos.observacionesGenerales.trim().toUpperCase(),
      izquierda,
      y,
      12
    )
    y += 1.5
    y = dibujarLinea(y, true)
  }

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('*** COMANDA DE PRODUCCION ***', centro, y, { align: 'center' })

  return y + 12
}

export const generarTicketPDF = (datos: DatosComandaCocina): jsPDF => {
  const docMedicion = new jsPDF({
    unit: 'mm',
    format: [80, 500],
  })
  const altoExacto = Math.max(renderizarContenidoTicket(docMedicion, datos), 95)

  const docFinal = new jsPDF({
    unit: 'mm',
    format: [80, altoExacto],
  })
  renderizarContenidoTicket(docFinal, datos)

  return docFinal
}

function renderizarLiquidacionDomicilios(doc: jsPDF, datos: DatosLiquidacionDomicilios): number {
  let y = 11
  const centro = 40
  const izquierda = 3
  const derecha = 77

  const dibujarLinea = (posY: number, doble = false): number => {
    const lineaY = posY + 2
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(doble ? 0.7 : 0.4)
    doc.line(izquierda, lineaY, derecha, lineaY)
    if (doble) {
      doc.line(izquierda, lineaY + 1.4, derecha, lineaY + 1.4)
      return lineaY + 4.5
    }
    return lineaY + 3.5
  }

  // --- 1. ENCABEZADO ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('POLICHINELO POS', centro, y, { align: 'center' })

  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('LIQUIDACIÓN DE DOMICILIOS', centro, y, { align: 'center' })

  y += 2
  y = dibujarLinea(y, true)

  // --- 2. FECHA Y HORA ---
  y += 4.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.text('FECHA:', izquierda, y)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.fecha, derecha, y, { align: 'right' })

  if (datos.hora) {
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text('HORA:', izquierda, y)
    doc.setFont('helvetica', 'normal')
    doc.text(datos.hora, derecha, y, { align: 'right' })
  }

  y += 2
  y = dibujarLinea(y)

  // --- 3. DOMICILIOS REALIZADOS ---
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.text('DOMICILIOS REALIZADOS:', izquierda, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(`${datos.cantidadDomicilios} envíos`, derecha, y, { align: 'right' })

  y += 2
  y = dibujarLinea(y, true)

  // --- 4. TOTAL A PAGAR (DESTACADO) ---
  y += 5.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('TOTAL A PAGAR:', izquierda, y)
  doc.setFontSize(16)
  doc.text(`$${Number(datos.totalPagar || 0).toLocaleString('es-CO')}`, derecha, y, {
    align: 'right',
  })

  y += 2.5
  y = dibujarLinea(y, true)

  // --- 5. RECAUDOS ---
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Efectivo recibido contraentrega:', izquierda, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.text(`$${Number(datos.efectivoContraentrega || 0).toLocaleString('es-CO')}`, derecha, y, {
    align: 'right',
  })

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Pagado por transferencia:', izquierda, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.text(`$${Number(datos.transferencia || 0).toLocaleString('es-CO')}`, derecha, y, {
    align: 'right',
  })

  y += 2
  y = dibujarLinea(y, true)

  // --- 6. FIRMAS DE CONFORMIDAD ---
  y += 18
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.line(izquierda, y, izquierda + 55, y)
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Firma Domiciliario:', izquierda, y)

  y += 14
  doc.line(izquierda, y, izquierda + 55, y)
  y += 4
  doc.text('Recibido conforme: $ _______________', izquierda, y)

  y += 4
  y = dibujarLinea(y)

  // --- 7. PIE ---
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('*** COMPROBANTE DE LIQUIDACION ***', centro, y, { align: 'center' })

  return y + 10
}

export const generarLiquidacionDomiciliosPDF = (datos: DatosLiquidacionDomicilios): jsPDF => {
  const docMedicion = new jsPDF({
    unit: 'mm',
    format: [80, 400],
  })
  const altoExacto = Math.max(renderizarLiquidacionDomicilios(docMedicion, datos), 110)

  const docFinal = new jsPDF({
    unit: 'mm',
    format: [80, altoExacto],
  })
  renderizarLiquidacionDomicilios(docFinal, datos)

  return docFinal
}
