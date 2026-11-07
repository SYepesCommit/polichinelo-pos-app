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

export function generarHtmlComanda(datos: any): string {
  const itemsHtml = (datos.items || [])
    .map((item: any) => {
      const obsHtml = item.observaciones
        ? `<div class="item-obs">** NOTA: ${escapeHtml(item.observaciones)}</div>`
        : ''
      const adicHtml = (item.adiciones || [])
        .map((a: string) => `<div class="item-adic">+ ${escapeHtml(a)}</div>`)
        .join('')

      return `
        <div class="item-block">
          <div class="row">
            <span class="col-cant-nombre font-bold">${item.cantidad}x ${escapeHtml(item.nombre)}</span>
            <span class="col-subtotal font-bold">$${Number(item.subtotal || 0).toLocaleString('es-CO')}</span>
          </div>
          ${obsHtml}
          ${adicHtml}
        </div>
      `
    })
    .join('')

  const fechaLimpia = datos.hora
    ? `${datos.fecha.replace(datos.hora, '').trim()} ${datos.hora}`
    : datos.fecha

  const clienteHtml = datos.cliente?.nombre
    ? `
      <div class="cliente-info">
        <div><strong>CLIENTE:</strong> ${escapeHtml(datos.cliente.nombre)}</div>
        ${datos.cliente.telefono ? `<div><strong>TEL:</strong> ${escapeHtml(datos.cliente.telefono)}</div>` : ''}
        ${datos.cliente.direccion ? `<div><strong>DIR:</strong> ${escapeHtml(datos.cliente.direccion)}</div>` : ''}
        ${datos.cliente.referenciaDireccion ? `<div><strong>REF:</strong> ${escapeHtml(datos.cliente.referenciaDireccion)}</div>` : ''}
      </div>
      <div class="divider"></div>
    `
    : ''

  const mesaHtml =
    datos.tipoPedido === 'MESA' && datos.mesa
      ? `<div class="font-bold text-center mesa-box">MESA / UBICACIÓN: #${datos.mesa}</div>`
      : ''

  const subtotalHtml =
    datos.costoDomicilio && datos.costoDomicilio > 0
      ? `
      <div class="row">
        <span>SUBTOTAL:</span>
        <span>$${Number(datos.subtotal || 0).toLocaleString('es-CO')}</span>
      </div>
      <div class="row">
        <span>DOMICILIO:</span>
        <span>$${Number(datos.costoDomicilio || 0).toLocaleString('es-CO')}</span>
      </div>
    `
      : ''

  const metodoPagoHtml = datos.metodoPago
    ? `<div class="row" style="margin-top: 3px;">
        <span>FORMA DE PAGO:</span>
        <span class="font-bold">${datos.metodoPago.toUpperCase()} ${
        datos.bancoNombre ? '(' + datos.bancoNombre.toUpperCase() + ')' : ''
      }</span>
      </div>`
    : ''

  const notasGeneralesHtml =
    datos.observacionesGenerales && datos.observacionesGenerales.trim()
      ? `<div class="nota-orden"><strong>NOTA GENERAL:</strong> ${escapeHtml(
          datos.observacionesGenerales.trim()
        )}</div>`
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
      margin: 0 auto;
      padding: 1mm 0 0 0;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.25;
      color: #000;
      background: #fff;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .title { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; }
    .subtitle { font-size: 13px; font-weight: 900; margin-top: 2px; }
    .divider { border-bottom: 1px dashed #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
    .col-cant-nombre { flex: 1; word-break: break-word; padding-right: 4px; }
    .col-subtotal { white-space: nowrap; }
    .item-block { margin-bottom: 4px; }
    .item-obs { font-size: 11px; font-weight: bold; padding-left: 10px; }
    .item-adic { font-size: 11px; padding-left: 10px; }
    .mesa-box { font-size: 14px; margin: 3px 0; }
    .cliente-info { font-size: 12px; margin: 3px 0; }
    .total-row { font-size: 15px; font-weight: 900; margin-top: 3px; }
    .nota-orden { font-size: 12px; margin-top: 3px; }
    .footer-comanda { font-size: 11px; font-weight: bold; text-align: center; margin-top: 5px; }
    .feed-bottom { height: 16mm; } /* Espacio para que el cortador físico no corte el texto final */
  </style>
</head>
<body>
  <div class="text-center title">POLICHINELO POS</div>
  <div class="text-center subtitle">*** ${datos.tipoPedido} ***</div>
  <div class="divider"></div>

  <div class="row">
    <span class="font-bold">ORDEN #${datos.consecutivo}</span>
    <span style="font-size: 11px;">${fechaLimpia}</span>
  </div>

  ${mesaHtml}
  <div class="divider"></div>

  ${clienteHtml}

  <div class="row font-bold" style="font-size: 11px; margin-bottom: 4px;">
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
