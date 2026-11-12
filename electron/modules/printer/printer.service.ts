import { BrowserWindow } from 'electron'

function escapeHtml(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatearTelefono(tel?: string): string {
  if (!tel) return ''
  const limpio = tel.replace(/\D/g, '')
  if (limpio.length === 10) {
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`
  }
  return tel.trim()
}

export function generarHtmlComanda(datos: any): string {
  const tituloTipo =
    datos.tipoPedido === 'DOMICILIO'
      ? '*** DESPACHO A DOMICILIO ***'
      : datos.tipoPedido === 'LLEVAR'
      ? '*** EMPACAR PARA LLEVAR ***'
      : '*** SERVICIO EN MESA ***'

  const fechaLimpia = datos.hora
    ? `${datos.fecha.replace(datos.hora, '').trim()} ${datos.hora}`
    : datos.fecha

  const nombreMostrar =
    datos.cliente?.nombre?.trim() || datos.detallesDestino?.trim() || 'Cliente'

  const telFormateado = formatearTelefono(datos.cliente?.telefono)
  const dirTexto = datos.cliente?.direccion?.trim()
  const refTexto = datos.cliente?.referenciaDireccion?.trim()

  const bloqueClienteHtml = `
    <div class="cliente-box">
      <div class="cliente-nombre"><strong>CLIENTE:</strong> ${escapeHtml(nombreMostrar.toUpperCase())}</div>
      ${
        datos.tipoPedido === 'DOMICILIO'
          ? `
        ${telFormateado ? `<div class="domicilio-tel"><strong>TEL:</strong> ${escapeHtml(telFormateado)}</div>` : ''}
        ${dirTexto ? `<div class="domicilio-dir"><strong>DIR:</strong> ${escapeHtml(dirTexto.toUpperCase())}</div>` : ''}
        ${refTexto ? `<div class="domicilio-ref"><strong>REF:</strong> ${escapeHtml(refTexto)}</div>` : ''}
      `
          : ''
      }
    </div>
  `

  const itemsHtml = (datos.items || [])
    .map((item: any) => {
      let carneElegida = ''
      const listaSalsas: string[] = []
      const listaSin: string[] = []
      const listaAdiciones: string[] = []
      const listaNotas: string[] = []

      if (item.observaciones && item.observaciones.trim()) {
        const bloques = item.observaciones.split(
          item.observaciones.includes(' | ') ? ' | ' : '\n'
        )
        bloques.forEach((bloque: string) => {
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
      }

      const carneHtml = carneElegida
        ? `<div class="obs-section">
            <div><span class="obs-title">[•] CARNE:</span> <span class="font-normal">${escapeHtml(carneElegida.toUpperCase())}</span></div>
          </div>`
        : ''

      const salsasHtml =
        listaSalsas.length > 0
          ? `<div class="obs-section">
              <div class="obs-title">[•] SALSAS:</div>
              <div class="obs-line">${escapeHtml(listaSalsas.join(', ').toUpperCase())}</div>
            </div>`
          : ''

      const sinHtml =
        listaSin.length > 0
          ? `<div class="obs-section">
              <div class="obs-title">[!] SIN (QUITAR):</div>
              ${listaSin
                .map((ing) => `<div class="obs-line">- ${escapeHtml(ing.toUpperCase())}</div>`)
                .join('')}
            </div>`
          : ''

      const adicHtml =
        listaAdiciones.length > 0
          ? `<div class="obs-section">
              <div class="obs-title">[+] ADICIONES:</div>
              ${listaAdiciones
                .map((ad) => `<div class="obs-line">+ ${escapeHtml(ad)}</div>`)
                .join('')}
            </div>`
          : ''

      const notasItemHtml =
        listaNotas.length > 0
          ? `<div class="obs-section">
              <div class="obs-title">[*] NOTA PLATO:</div>
              ${listaNotas
                .map((nt) => `<div class="obs-line">* ${escapeHtml(nt)}</div>`)
                .join('')}
            </div>`
          : ''

      return `
        <div class="item-block">
          <div class="row">
            <span class="col-cant-nombre font-bold">${item.cantidad}x ${escapeHtml(item.nombre)}</span>
            <span class="col-subtotal">$${Number(item.subtotal || 0).toLocaleString('es-CO')}</span>
          </div>
          ${carneHtml}
          ${salsasHtml}
          ${sinHtml}
          ${adicHtml}
          ${notasItemHtml}
        </div>
      `
    })
    .join('')

  const subtotalHtml =
    datos.costoDomicilio && datos.costoDomicilio > 0
      ? `
      <div class="row footer-money">
        <span class="font-bold">SUBTOTAL:</span>
        <span>$${Number(datos.subtotal || 0).toLocaleString('es-CO')}</span>
      </div>
      <div class="row footer-money">
        <span class="font-bold">DOMICILIO:</span>
        <span>$${Number(datos.costoDomicilio || 0).toLocaleString('es-CO')}</span>
      </div>
    `
      : ''

  const esMixto = Boolean(
    (Array.isArray(datos.pagos) && datos.pagos.length > 1) ||
      datos.metodoPago?.toUpperCase().includes('MIXTO')
  )
  const esEfectivo = Boolean(
    !esMixto && datos.metodoPago?.toUpperCase().includes('EFECTIVO')
  )

  let metodoPagoHtml = ''
  if (esMixto && Array.isArray(datos.pagos) && datos.pagos.length > 0) {
    const pagoEfvo = datos.pagos.find((p: any) =>
      p.metodoPago?.toUpperCase().includes('EFECTIVO')
    )
    const montoEfvoParte = Number(pagoEfvo?.monto || 0)

    if (datos.tipoPedido === 'DOMICILIO' && montoEfvoParte > 0) {
      metodoPagoHtml += `
        <div class="cobro-domicilio">
          <strong>MIXTO - COBRAR EFECTIVO:</strong> $${montoEfvoParte.toLocaleString('es-CO')}
        </div>
      `
    }

    metodoPagoHtml += `
      <div class="row footer-money" style="margin-top: 4px;">
        <span class="font-bold">PAGO:</span>
        <span>MIXTO (EFECTIVO + TRANSF.)</span>
      </div>
    `

    datos.pagos.forEach((p: any) => {
      const esP_Efvo = p.metodoPago?.toUpperCase().includes('EFECTIVO')
      const etiqueta = esP_Efvo
        ? '  • EN EFECTIVO:'
        : `  • TRANSF.${p.bancoNombre ? ` (${p.bancoNombre.toUpperCase()})` : ''}:`
      metodoPagoHtml += `
        <div class="row footer-money-sub">
          <span>${escapeHtml(etiqueta)}</span>
          <span>$${Number(p.monto || 0).toLocaleString('es-CO')}</span>
        </div>
      `
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

      metodoPagoHtml += `
        <div class="row footer-money" style="margin-top: 3px;">
          <span class="font-bold">PAGA EFECTIVO CON:</span>
          <span>$${montoRecibidoEfectivo.toLocaleString('es-CO')}</span>
        </div>
        <div class="row footer-cambio">
          <span class="font-bold">CAMBIO A DEVOLVER:</span>
          <span>$${cambioEfectivo.toLocaleString('es-CO')}</span>
        </div>
      `
    }
  } else if (datos.metodoPago) {
    if (datos.tipoPedido === 'DOMICILIO' && esEfectivo) {
      metodoPagoHtml = `
        <div class="cobro-domicilio">
          <strong>COBRAR EN EFECTIVO:</strong> $${Number(datos.total || 0).toLocaleString('es-CO')}
        </div>
      `
    } else {
      const textoMetodo = datos.bancoNombre
        ? `${datos.metodoPago.toUpperCase()} (${datos.bancoNombre.toUpperCase()})`
        : datos.metodoPago.toUpperCase()
      metodoPagoHtml = `
        <div class="row footer-money" style="margin-top: 4px;">
          <span class="font-bold">PAGO:</span>
          <span>${escapeHtml(textoMetodo)}</span>
        </div>
      `
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

      metodoPagoHtml += `
        <div class="row footer-money" style="margin-top: 3px;">
          <span class="font-bold">PAGA CON (EFECTIVO):</span>
          <span>$${montoRecibidoEfectivo.toLocaleString('es-CO')}</span>
        </div>
        <div class="row footer-cambio">
          <span class="font-bold">CAMBIO A DEVOLVER:</span>
          <span>$${cambioEfectivo.toLocaleString('es-CO')}</span>
        </div>
      `
    }
  }

  const notasGeneralesHtml =
    datos.observacionesGenerales && datos.observacionesGenerales.trim()
      ? `
        <div class="divider-double"></div>
        <div class="nota-orden">
          <strong>NOTA ORDEN:</strong> ${escapeHtml(datos.observacionesGenerales.trim().toUpperCase())}
        </div>
        <div class="divider-double"></div>
      `
      : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 0;
      size: 80mm auto;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 72mm;
      margin: 0;
      padding: 2mm 1.5mm 0 1.5mm;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.35;
      color: #000;
      background: #fff;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 800; }
    .font-normal { font-weight: normal; }
    .title { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 2px; }
    .subtitle { font-size: 14px; font-weight: 800; margin-top: 3px; margin-bottom: 3px; }
    .divider { border-bottom: 2px dashed #000; margin: 6px 0; }
    .divider-double { border-bottom: 3px solid #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .col-cant-nombre { flex: 1; word-break: break-word; padding-right: 4px; font-size: 20.5px; font-weight: 800; }
    .col-subtotal { white-space: nowrap; font-size: 19px; font-weight: normal; }
    .cliente-box { margin: 5px 0; }
    .cliente-nombre { font-size: 14.5px; font-weight: normal; margin-bottom: 3px; }
    .domicilio-tel { font-size: 14.5px; font-weight: normal; margin-bottom: 3px; }
    .domicilio-dir { font-size: 15px; font-weight: normal; margin-bottom: 3px; }
    .domicilio-ref { font-size: 13.5px; font-weight: normal; margin-top: 2px; }
    .item-block { margin-bottom: 12px; }
    .obs-section { padding-left: 6px; margin-top: 5px; font-size: 18.5px; font-weight: normal; }
    .obs-title { font-weight: 800; text-decoration: underline; margin-bottom: 2px; }
    .obs-line { padding-left: 6px; margin-top: 2px; font-weight: normal; }
    .total-row { font-size: 16px; font-weight: 800; margin-top: 4px; margin-bottom: 4px; }
    .footer-money { font-size: 13.5px; margin-bottom: 3px; font-weight: normal; }
    .footer-money-sub { font-size: 12.5px; margin-bottom: 3px; font-weight: normal; }
    .footer-cambio { font-size: 14px; margin-bottom: 3px; font-weight: normal; }
    .cobro-domicilio { font-size: 13.5px; font-weight: normal; text-align: center; margin: 5px 0; padding: 3px 0; border-top: 2px solid #000; border-bottom: 2px solid #000; }
    .nota-orden { font-size: 15px; font-weight: normal; margin: 5px 0; }
    .footer-comanda { font-size: 12px; font-weight: 800; text-align: center; margin-top: 5px; }
    .feed-bottom { height: 16mm; }
  </style>
</head>
<body>
  <div class="text-center title">POLICHINELO POS</div>
  <div class="text-center subtitle">${tituloTipo}</div>
  <div class="divider"></div>

  <div class="row">
    <span class="font-bold" style="font-size: 15.5px;">ORDEN #${datos.consecutivo}</span>
    <span style="font-size: 12.5px;"><strong>FECHA:</strong> ${fechaLimpia}</span>
  </div>
  <div class="divider"></div>

  ${bloqueClienteHtml}
  <div class="divider"></div>

  <div class="row font-bold" style="font-size: 13.5px; margin-bottom: 5px;">
    <span>CANT  PRODUCTO</span>
    <span>SUBTOTAL</span>
  </div>

  ${itemsHtml}

  <div class="divider"></div>

  ${subtotalHtml}
  <div class="row total-row">
    <span>TOTAL:</span>
    <span>$${Number(datos.total || 0).toLocaleString('es-CO')}</span>
  </div>

  ${metodoPagoHtml}
  ${notasGeneralesHtml}

  <div class="divider"></div>
  <div class="footer-comanda">*** COMANDA DE PRODUCCION ***</div>
  <div class="feed-bottom"></div>
</body>
</html>`
}

export async function imprimirComandaTermica(
  datos: any,
  nombreImpresora?: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const html = generarHtmlComanda(datos)

      const win = new BrowserWindow({
        show: false,
        width: 302, // ~80mm
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      })

      const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html)

      win.webContents.on('did-finish-load', () => {
        win.webContents
          .getPrintersAsync()
          .then((printers) => {
            let printerName = nombreImpresora

            if (!printerName) {
              const thermalPrinter = printers.find((p) =>
                /pos|receipt|thermal|termica|80|58|tm-t|bixolon|xprinter|star/i.test(
                  p.name || p.displayName || ''
                )
              )
              if (thermalPrinter) {
                printerName = thermalPrinter.name
              }
            }

            console.log('🖨️ Imprimiendo silenciosamente comanda en:', printerName || 'Predeterminada')

            const printOptions: any = {
              silent: true,
              printBackground: true,
              margins: {
                marginType: 'none', // 🔴 Margen cero absoluto: no avanza papel en blanco arriba
              },
            }

            if (printerName) {
              printOptions.deviceName = printerName
            }

            win.webContents.print(printOptions, (success, failureReason) => {
              try {
                win.close()
              } catch {
                // Ignorar si ya está cerrada
              }

              if (success) {
                console.log('✅ Ticket impreso con éxito sin márgenes.')
                resolve({ success: true })
              } else {
                console.warn('⚠️ Falló la impresión directa:', failureReason)
                resolve({ success: false, error: failureReason })
              }
            })
          })
          .catch((err) => {
            try {
              win.close()
            } catch {}
            resolve({ success: false, error: err.message })
          })
      })

      win.loadURL(dataUrl).catch((err) => {
        try {
          win.close()
        } catch {}
        resolve({ success: false, error: err.message })
      })
    } catch (err: any) {
      console.error('Error generando ventana de impresión:', err)
      resolve({ success: false, error: err.message })
    }
  })
}
