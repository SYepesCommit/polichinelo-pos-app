import jsPDF from 'jspdf'
import { DatosComandaCocina } from '../types/pos/posView.types'

function formatearTelefono(tel?: string): string {
  if (!tel) return ''
  const limpio = tel.replace(/\D/g, '')
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`
  }
  return tel.trim()
}

function renderizarContenidoTicket(doc: jsPDF, datos: DatosComandaCocina): number {
  let y = 7
  const centro = 36
  const izquierda = 2
  const derecha = 70
  const anchoMaximoTexto = 68

  const SEPARADOR = '----------------------------------'
  const SEPARADOR_DOBLE = '=================================='

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

  // --- 1. ENCABEZADO SEGÚN EL TIPO DE ORDEN ---
  doc.setFont('courier', 'bold')
  doc.setFontSize(13)
  doc.text('POLICHINELO POS', centro, y, { align: 'center' })

  y += 4.5
  doc.setFontSize(10)
  const tituloTipo =
    datos.tipoPedido === 'DOMICILIO'
      ? '*** DESPACHO A DOMICILIO ***'
      : datos.tipoPedido === 'LLEVAR'
      ? '*** EMPACAR PARA LLEVAR ***'
      : '*** SERVICIO EN MESA ***'
  doc.text(tituloTipo, centro, y, { align: 'center' })

  y += 3.5
  doc.setFontSize(8)
  doc.setFont('courier', 'normal')
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- 2. ORDEN, FECHA Y HORA ---
  y += 4.2
  doc.setFont('courier', 'bold')
  doc.setFontSize(9.5)
  doc.text(`ORDEN #${datos.consecutivo}`, izquierda, y)

  doc.setFont('courier', 'normal')
  doc.setFontSize(7.5)
  const fechaLimpia = datos.hora
    ? `${datos.fecha.replace(datos.hora, '').trim()} ${datos.hora}`
    : datos.fecha
  doc.text(fechaLimpia, derecha, y, { align: 'right' })

  // --- 3. DATOS DEL CLIENTE Y ENTREGA (SIEMPRE CON NOMBRE) ---
  const nombreMostrar =
    datos.cliente?.nombre?.trim() || datos.detallesDestino?.trim() || 'Cliente'

  y += 4.5
  y = escribirTextoConSalto(`CLIENTE: ${nombreMostrar.toUpperCase()}`, izquierda, y, 9, true)

  if (datos.tipoPedido === 'DOMICILIO') {
    const telFormateado = formatearTelefono(datos.cliente?.telefono)
    if (telFormateado) {
      y += 0.5
      y = escribirTextoConSalto(`TEL: ${telFormateado}`, izquierda, y, 9, true)
    }

    const dirTexto = datos.cliente?.direccion?.trim()
    if (dirTexto) {
      y += 0.8
      y = escribirTextoConSalto(`DIR: ${dirTexto.toUpperCase()}`, izquierda, y, 9.5, true)
    }

    const refTexto = datos.cliente?.referenciaDireccion?.trim()
    if (refTexto) {
      y += 0.5
      y = escribirTextoConSalto(`REF: ${refTexto}`, izquierda, y, 8.5, true)
    }
  }

  y += 1.5
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- 4. TABLA DE PRODUCTOS ---
  y += 4
  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('CANT  PRODUCTO', izquierda, y)
  doc.text('SUBTOTAL', derecha, y, { align: 'right' })

  y += 3.5
  doc.setFont('courier', 'normal')
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- 5. ÍTEMS DE LA COMANDA Y ALERTAS DE COCINA ---
  y += 4
  datos.items.forEach((item) => {
    doc.setFont('courier', 'bold')
    doc.setFontSize(8.5)

    const textoCant = `${item.cantidad}x`
    const textoPrecio = `$${Number(item.subtotal || 0).toLocaleString('es-CO')}`

    doc.text(textoCant, izquierda, y)
    doc.text(textoPrecio, derecha, y, { align: 'right' })

    y = escribirTextoConSalto(item.nombre, 11, y, 8.5, true, 41)

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
        y = escribirTextoConSalto(
          `  [•] CARNE: ${carneElegida.toUpperCase()}`,
          izquierda,
          y,
          8,
          true,
          64
        )
      }

      if (listaSalsas.length > 0) {
        y = escribirTextoConSalto(
          `  [•] SALSAS: ${listaSalsas.join(', ').toUpperCase()}`,
          izquierda,
          y,
          7.8,
          true,
          64
        )
      }

      if (listaSin.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.8)
        doc.text('  [!] SIN (QUITAR):', izquierda, y)
        y += 3.3

        listaSin.forEach((ing) => {
          y = escribirTextoConSalto(`    - ${ing.toUpperCase()}`, izquierda, y, 7.8, true, 64)
        })
      }

      if (listaAdiciones.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.8)
        doc.text('  [+] ADICIONES:', izquierda, y)
        y += 3.3

        listaAdiciones.forEach((adic) => {
          y = escribirTextoConSalto(`    + ${adic}`, izquierda, y, 7.8, true, 64)
        })
      }

      if (listaNotas.length > 0) {
        doc.setFont('courier', 'bold')
        doc.setFontSize(7.8)
        doc.text('  [*] NOTA PLATO:', izquierda, y)
        y += 3.3

        listaNotas.forEach((nota) => {
          y = escribirTextoConSalto(`    * ${nota}`, izquierda, y, 7.8, true, 64)
        })
      }
    }

    y += 2
  })

  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.text(SEPARADOR, centro, y, { align: 'center' })

  // --- 6. TOTALES Y MEDIO DE PAGO ---
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
    y += 4.5

    if (datos.tipoPedido === 'DOMICILIO' && montoEfvoParte > 0) {
      y = escribirTextoConSalto(
        `>>> MIXTO - COBRAR EFECTIVO: $${montoEfvoParte.toLocaleString('es-CO')} <<<`,
        izquierda,
        y,
        8.2,
        true
      )
      y += 0.5
    }

    y = escribirTextoConSalto('PAGO: MIXTO (EFECTIVO + TRANSF.)', izquierda, y, 8.5, true)

    datos.pagos.forEach((p) => {
      const esP_Efvo = p.metodoPago?.toUpperCase().includes('EFECTIVO')
      const etiqueta = esP_Efvo
        ? '  • EN EFECTIVO:'
        : `  • TRANSF.${p.bancoNombre ? ` (${p.bancoNombre.toUpperCase()})` : ''}:`
      doc.setFont('courier', 'bold')
      doc.setFontSize(8)
      doc.text(etiqueta, izquierda, y)
      doc.text(`$${Number(p.monto || 0).toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 3.6
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

      y += 0.5
      doc.setFont('courier', 'bold')
      doc.setFontSize(8.2)
      doc.text('PAGA EFECTIVO CON:', izquierda, y)
      doc.text(`$${montoRecibidoEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 3.8
      doc.setFontSize(8.8)
      doc.text('CAMBIO A DEVOLVER:', izquierda, y)
      doc.text(`$${cambioEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 2
    }
  } else if (datos.metodoPago) {
    const esEfectivo = datos.metodoPago.toUpperCase().includes('EFECTIVO')
    y += 4.5

    if (datos.tipoPedido === 'DOMICILIO' && esEfectivo) {
      y = escribirTextoConSalto(
        `>>> COBRAR EN EFECTIVO: $${Number(datos.total || 0).toLocaleString('es-CO')} <<<`,
        izquierda,
        y,
        8.5,
        true
      )
    } else {
      const textoPago = datos.bancoNombre
        ? `PAGO: ${datos.metodoPago.toUpperCase()} (${datos.bancoNombre.toUpperCase()})`
        : `PAGO: ${datos.metodoPago.toUpperCase()}`
      y = escribirTextoConSalto(textoPago, izquierda, y, 8.5, true)
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

      y += 0.5
      doc.setFont('courier', 'bold')
      doc.setFontSize(8.2)
      doc.text('PAGA CON (EFECTIVO):', izquierda, y)
      doc.text(`$${montoRecibidoEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 3.8
      doc.setFontSize(8.8)
      doc.text('CAMBIO A DEVOLVER:', izquierda, y)
      doc.text(`$${cambioEfectivo.toLocaleString('es-CO')}`, derecha, y, {
        align: 'right',
      })
      y += 2
    }
  }

  // --- 8. NOTAS GENERALES DE LA ORDEN ---
  if (datos.observacionesGenerales && datos.observacionesGenerales.trim()) {
    y += 2
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.text(SEPARADOR_DOBLE, centro, y, { align: 'center' })
    y += 3.8
    y = escribirTextoConSalto(
      `NOTA ORDEN: ${datos.observacionesGenerales.trim().toUpperCase()}`,
      izquierda,
      y,
      8.5,
      true
    )
    doc.setFont('courier', 'normal')
    doc.setFontSize(8)
    doc.text(SEPARADOR_DOBLE, centro, y, { align: 'center' })
  }

  y += 4.5
  doc.setFont('courier', 'bold')
  doc.setFontSize(8)
  doc.text('*** COMANDA DE PRODUCCION ***', centro, y, { align: 'center' })

  return y + 7
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
