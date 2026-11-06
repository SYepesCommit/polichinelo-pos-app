import { PosPrinter, PosPrintData, PosPrintOptions } from 'electron-pos-printer'
import { DatosComandaCocina } from '../types/pos/posView.types'

export const imprimirComandaTermica = async (
  datos: DatosComandaCocina,
  nombreImpresora?: string
) => {
  const options: PosPrintOptions = {
    printerName: nombreImpresora || '', // Si está vacío, usa la impresora predeterminada del sistema
    silent: true,
    preview: false,
    margin: '0 0 0 0',
    copies: 1,
    pageSize: '80mm',
  }

  const data: PosPrintData[] = [
    // Encabezado
    {
      type: 'text',
      value: 'POLICHINELO POS',
      style: { textAlign: 'center', fontSize: '18px', fontWeight: 'bold' },
    },
    {
      type: 'text',
      value: `*** ${datos.tipoPedido} ***`,
      style: { textAlign: 'center', fontSize: '14px', fontWeight: 'bold' },
    },
    {
      type: 'text',
      value: '----------------------------------------',
      style: { textAlign: 'center' },
    },

    // Info del Pedido
    {
      type: 'text',
      value: `ORDEN #${datos.consecutivo} - ${datos.fecha}`,
      style: { fontSize: '12px', fontWeight: 'bold' },
    },
  ]

  // Info del Cliente si existe
  if (datos.cliente?.nombre) {
    data.push({
      type: 'text',
      value: `CLIENTE: ${datos.cliente.nombre}`,
      style: { fontSize: '11px', fontWeight: 'bold' },
    })
    if (datos.cliente.telefono) {
      data.push({
        type: 'text',
        value: `TEL: ${datos.cliente.telefono}`,
        style: { fontSize: '11px' },
      })
    }
    if (datos.tipoPedido === 'DOMICILIO' && datos.cliente.direccion) {
      data.push({
        type: 'text',
        value: `DIR: ${datos.cliente.direccion}`,
        style: { fontSize: '11px', fontWeight: 'bold' },
      })
    }
  }

  data.push({
    type: 'text',
    value: '----------------------------------------',
    style: { textAlign: 'center' },
  })

  // Detalle de Productos
  datos.items.forEach((item) => {
    data.push({
      type: 'text',
      value: `${item.cantidad}x ${item.nombre}`,
      style: { fontSize: '12px', fontWeight: 'bold' },
    })

    if (item.observaciones) {
      data.push({
        type: 'text',
        value: `   OJO: ${item.observaciones}`,
        style: { fontSize: '10px' },
      })
    }
  })

  data.push({
    type: 'text',
    value: '----------------------------------------',
    style: { textAlign: 'center' },
  })

  // Totales
  if (datos.costoDomicilio && datos.costoDomicilio > 0) {
    data.push({
      type: 'text',
      value: `DOMICILIO: $${datos.costoDomicilio.toLocaleString('es-CO')}`,
      style: { fontSize: '11px' },
    })
  }

  data.push({
    type: 'text',
    value: `TOTAL: $${datos.total.toLocaleString('es-CO')}`,
    style: { fontSize: '16px', fontWeight: 'bold' },
  })

  if (datos.metodoPago) {
    data.push({
      type: 'text',
      value: `PAGO: ${datos.metodoPago.toUpperCase()}`,
      style: { fontSize: '11px' },
    })
  }

  data.push({
    type: 'text',
    value: '\n*** COMANDA DE COCINA ***\n\n',
    style: { textAlign: 'center', fontSize: '11px', fontWeight: 'bold' },
  })

  try {
    await PosPrinter.print(data, options)
    console.log('✅ Ticket impreso correctamente en 80mm')
  } catch (error) {
    console.error('❌ Error al imprimir en la térmica:', error)
  }
}