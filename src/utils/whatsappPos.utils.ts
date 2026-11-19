import { Banco, Categoria, ItemCarrito, MetodoPago, Producto, TipoPedido } from '@/types/pos/pos'
import { DatosComandaCocina } from '@/types/pos/posView.types'

export interface ItemDetectadoWhatsApp {
  idTemp: string
  producto: Producto
  cantidad: number
  observaciones: string
  lineaOriginal: string
}

export interface ResultadoAnalisisWhatsApp {
  tipoPedido: TipoPedido
  telefono: string
  nombreCliente: string
  direccion: string
  referencia: string
  montoDomicilio: number
  metodoPagoTexto: 'EFECTIVO' | 'TRANSFERENCIA' | null
  bancoIdDetectado: string | null
  bancoNombreDetectado: string | null
  observacionesGenerales: string
  items: ItemDetectadoWhatsApp[]
}

export const PLANTILLA_WHATSAPP_CLIENTE = `¡Hola! 👋 Para tomar tu pedido en *Polichinelo* más rápido, regálanos estos datos:
• *Nombre:* 
• *Teléfono:* 
• *Dirección y Barrio:* 
• *Pedido:* 
• *Medio de pago (Efectivo / Nequi / Bancolombia):* `

export function normalizarTextoWA(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function singularizarPalabra(palabra: string): string {
  if (palabra.length <= 3) return palabra
  if (palabra.endsWith('es') && palabra.length > 4 && !palabra.endsWith('nes')) {
    return palabra.slice(0, -1)
  }
  if (palabra.endsWith('s') && !palabra.endsWith('ss')) {
    return palabra.slice(0, -1)
  }
  return palabra
}

const MAPA_NUMEROS_TEXTO: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
}

const REGEX_PRODUCTOS_GENERAL =
  /\b(?:hamb|hamburguesa|perro|perra|salchipapa|salchi|chori|picada|minipoli|granpoli|arepa|papa|porcion|chuzo|pechuga|chuleta|costichi|churrasco|patacon|maicito|coca|gaseosa|descarada|ranchera|alitas)[a-z]*\b/i

const REGEX_INICIO_ENTREGA =
  /\b(?:soy|hablas?\s+con|mi\s+nombre\s+es|a\s+nombre\s+de|recibe\s*[:\-]|cliente\s*[:\-]|para\s+enviar\s+a|enviar\s+a|mandar\s+a|(?:calle|cll|carrera|cra|kr|diagonal|diag|transversal|tv|avenida|av|mz|manzana|vereda)\s+[0-9a-z]+|cel(?:ular)?\s*[:\-]?\s*3\d{2}|tel(?:efono)?\s*[:\-]?\s*\d+)\b/i

const REGEX_INICIO_PEDIDO =
  /\b(?:para\s+pedir|quiero\s+pedir|me\s+manda[s]?|mandame|mándame|m[aá]ndeme|me\s+regala[s]?|reg[aá]lame|el\s+pedido\s+es|la\s+orden\s+es|porfa(?:vor)?\s+m[aá]nda(?:me|nos)?|quiero\b)/i

function agregarLineaOpartes(texto: string, salida: string[]): void {
  const tNorm = normalizarTextoWA(texto)
  const tieneProductos = REGEX_PRODUCTOS_GENERAL.test(tNorm)
  const matchEntrega = texto.match(REGEX_INICIO_ENTREGA)
  const matchPedido = texto.match(REGEX_INICIO_PEDIDO)

  if (
    tieneProductos &&
    matchEntrega &&
    matchEntrega.index !== undefined &&
    matchEntrega.index > 0 &&
    (!matchPedido || matchPedido.index === undefined || matchPedido.index < matchEntrega.index)
  ) {
    // Pedido primero, Datos de Entrega después (ej: "...una minipolipicada a nombre de stiven cel...")
    const partePedido = texto.slice(0, matchEntrega.index).trim()
    const parteEntrega = texto.slice(matchEntrega.index).trim()
    if (partePedido) salida.push(partePedido)
    if (parteEntrega) salida.push(parteEntrega)
    return
  } else if (
    tieneProductos &&
    matchEntrega &&
    matchEntrega.index !== undefined &&
    matchPedido &&
    matchPedido.index !== undefined &&
    matchPedido.index > matchEntrega.index
  ) {
    // Datos de Entrega primero, Pedido después (ej: "hola soy stiven cel... para pedir dos hamb...")
    const parteEntrega = texto.slice(0, matchPedido.index).trim()
    const partePedido = texto.slice(matchPedido.index).trim()
    if (parteEntrega) salida.push(parteEntrega)
    if (partePedido) salida.push(partePedido)
    return
  }

  salida.push(texto)
}

export function analizarMensajeWhatsApp(
  textoRaw: string,
  categorias: Categoria[],
  adicionesDisponibles: { nombre: string; precio: number }[],
  bancos: Banco[]
): ResultadoAnalisisWhatsApp {
  const resultado: ResultadoAnalisisWhatsApp = {
    tipoPedido: 'DOMICILIO',
    telefono: '',
    nombreCliente: '',
    direccion: '',
    referencia: '',
    montoDomicilio: 0,
    metodoPagoTexto: null,
    bancoIdDetectado: null,
    bancoNombreDetectado: null,
    observacionesGenerales: '',
    items: [],
  }

  if (!textoRaw.trim()) return resultado

  // 0. Extraer teléfono y posible nombre desde los encabezados de WhatsApp Web ANTES de limpiarlos
  // Ej: "[9:15 p. m., 14/11/2026] +57 314 567 8901: hola" o "[9:15 p. m.] Carlos Perez: hola"
  let nombreRemitenteChat = ''
  const matchHeaderTel = textoRaw.match(
    /(?:\+?57[\s.\-]*)?(3\d{2}[\s.\-]?\d{3}[\s.\-]?\d{4})\b/
  )
  if (matchHeaderTel && matchHeaderTel[1]) {
    resultado.telefono = matchHeaderTel[1].replace(/\D/g, '')
  }

  const lineasBrutas = textoRaw.split(/\r?\n/)
  const lineasLimpias: string[] = []

  for (const l of lineasBrutas) {
    const matchCabecera = l.match(/^\[.*?\]\s*([^:]{1,40}):\s*(.*)$/i)
    if (matchCabecera) {
      const remitente = matchCabecera[1].trim()
      const contenido = matchCabecera[2].trim()

      // Ignorar los mensajes enviados por el propio restaurante en el chat
      if (/polichinelo|restaurante/i.test(remitente)) {
        continue
      }

      if (
        !nombreRemitenteChat &&
        !/\d{3}/.test(remitente) &&
        remitente.length >= 2 &&
        remitente.length <= 35
      ) {
        nombreRemitenteChat = remitente
      }

      const limpio = contenido.replace(/^[•\-*➡️👉✅🔹🔸👤📍📱💵💳]\s*/, '').trim()
      if (limpio) {
        agregarLineaOpartes(limpio, lineasLimpias)
      }
    } else {
      const limpio = l.replace(/^[•\-*➡️👉✅🔹🔸👤📍📱💵💳]\s*/, '').trim()
      if (limpio) {
        agregarLineaOpartes(limpio, lineasLimpias)
      }
    }
  }

  const textoCompleto = lineasLimpias.join('\n')
  const textoNorm = normalizarTextoWA(textoCompleto)

  // 1. Detectar si menciona explícitamente recoger / para llevar o mesa
  if (
    /\b(para llevar|paso a recoger|recoger en local|voy por el|paso por el|paso por all[aá]|voy a recoger|a recoger|recojo en|paso en \d+ min)/i.test(
      textoNorm
    )
  ) {
    resultado.tipoPedido = 'LLEVAR'
  }

  // 2. Detectar teléfono en el cuerpo si no estaba en cabecera (o actualizar con el del cuerpo)
  const matchesTelCuerpo = Array.from(
    textoCompleto.matchAll(/(?:\+?57[\s.\-]*)?(3\d{2}[\s.\-]?\d{3}[\s.\-]?\d{4})\b/g)
  )
  if (matchesTelCuerpo.length > 0) {
    const ultimoTel = matchesTelCuerpo[matchesTelCuerpo.length - 1][1].replace(/\D/g, '')
    if (ultimoTel.length === 10) resultado.telefono = ultimoTel
  }

  // 3. Detectar método de pago y banco
  for (const banco of bancos) {
    const bNorm = normalizarTextoWA(banco.nombre)
    if (bNorm && textoNorm.includes(bNorm)) {
      resultado.metodoPagoTexto = 'TRANSFERENCIA'
      resultado.bancoIdDetectado = banco.id
      resultado.bancoNombreDetectado = banco.nombre
      break
    }
  }
  if (!resultado.metodoPagoTexto) {
    if (/\b(nequi|bancolombia|daviplata|transfiya|transferencia|qr|bre-?b|transfiero)\b/i.test(textoNorm)) {
      resultado.metodoPagoTexto = 'TRANSFERENCIA'
      const bancoPorDefecto = bancos.find((b) => {
        const bn = normalizarTextoWA(b.nombre)
        return (
          (textoNorm.includes('nequi') && bn.includes('nequi')) ||
          (textoNorm.includes('bancolombia') && bn.includes('bancolombia')) ||
          (textoNorm.includes('daviplata') && bn.includes('daviplata'))
        )
      })
      if (bancoPorDefecto) {
        resultado.bancoIdDetectado = bancoPorDefecto.id
        resultado.bancoNombreDetectado = bancoPorDefecto.nombre
      }
    } else if (
      /\b(efectivo|contraentrega|billete de|devuelta de|pago con un billete|paga con)\b/i.test(
        textoNorm
      )
    ) {
      resultado.metodoPagoTexto = 'EFECTIVO'
    }
  }

  // 4. Aplanar catálogo de productos activos para búsqueda inteligente
  const todosProductos: Producto[] = []
  categorias.forEach((cat) => {
    cat.productos.forEach((p) => {
      if (!todosProductos.some((ex) => ex.id === p.id)) {
        todosProductos.push(p)
      }
    })
  })

  const palabrasIgnorar = new Set([
    'de',
    'del',
    'la',
    'el',
    'los',
    'las',
    'con',
    'por',
    'para',
    'una',
    'uno',
    'un',
    'o',
  ])

  // Diccionario de sinónimos y alias comunes para emparejar términos coloquiales
  const SINONIMOS_PRODUCTOS: Record<string, string[]> = {
    coca: ['coca cola', 'cocacola', 'coca-cola', 'gaseosa'],
    cocacola: ['coca cola', 'coca-cola', 'coca'],
    pepsi: ['gaseosa pepsi'],
    postobon: ['gaseosa postobon'],
    manzana: ['postobon manzana', 'gaseosa manzana'],
    colombiana: ['gaseosa colombiana'],
    quatro: ['cuatro', 'gaseosa quatro'],
    sprite: ['gaseosa sprite'],
    agua: ['botella de agua', 'agua cristal', 'agua brisa'],
    hamb: ['hamburguesa'],
    salchi: ['salchipapa'],
    chori: ['chori papa', 'choripapa', 'chori-papa', 'chori papas'],
    choripapa: ['chori papa', 'chori-papa'],
    picada: ['minipolipicada', 'granpolipicada'],
    chuzo: ['chuzo de pollo'],
    pechuga: ['pechuga gratinada'],
    chuleta: ['chuleta de cerdo'],
  }

  const productosIndexados = todosProductos.map((p) => {
    const norm = normalizarTextoWA(p.nombre)
    const tokens = norm
      .split(/[\s\-]+/)
      .map((t) => singularizarPalabra(t.replace(/[^a-z0-9]/g, '')))
      .filter(
        (t) =>
          t.length >= 2 &&
          !palabrasIgnorar.has(t) &&
          !/^\d+(?:g|gr|gramos|ml|l|lt|oz)$/i.test(t)
      )

    // Si el producto tiene alias configurados manualmente en el módulo de productos
    // (Usar aliasWhatsApp si viene del backend; evitar tomar la lista automática de ingredientes como alias)
    const aliasList: string[] = []
    const textoAlias =
      p.aliasWhatsApp !== undefined
        ? p.aliasWhatsApp
        : p.ingredientes && p.descripcion === p.ingredientes.join(', ')
          ? null
          : p.descripcion
    if (textoAlias) {
      const aliasRaw = textoAlias.split(/[,;\n]+/).map((a) => normalizarTextoWA(a)).filter(Boolean)
      aliasList.push(...aliasRaw)
      aliasRaw.forEach((a) => {
        a.split(/\s+/).forEach((w) => {
          const sw = singularizarPalabra(w.replace(/[^a-z0-9]/g, ''))
          if (sw.length >= 2 && !palabrasIgnorar.has(sw)) {
            tokens.push(sw)
          }
        })
      })
    }

    return { producto: p, norm, tokens, aliasList }
  })

  // Funciones auxiliares para extraer exclusiones y adiciones de un texto
  const extraerExclusiones = (txt: string): string[] => {
    const matchesSin = Array.from(
      txt.matchAll(
        /\b(?:sin|nada de|no le eche[n]?|qu[ií]ta(?:le|rle|les|nle)?)\s+([a-záéíóúñ]+(?:\s+(?:ni|y|,)?\s*[a-záéíóúñ]+){0,4})/gi
      )
    )
    if (matchesSin.length === 0) return []
    const items: string[] = []
    for (const m of matchesSin) {
      const partes = m[1]
        .replace(
          /\b(por\s+favor|porfa|gracias|pero|y\s+una?|y\s+dos|y\s+\d+|y\s+las?\s+otras?|y\s+los?\s+otros?|y\s+el\s+otro|y\s+la\s+otra|con\s+adici[oó]n|con\s+extra|y\s+con).*$/i,
          ''
        )
        .split(/\s*(?:,|ni|\by\b)\s*/i)
        .map((x) => x.replace(/^(la|el|las|los|de)\s+/i, '').trim())
        .filter((x) => x.length >= 3)
      items.push(...partes)
    }
    return Array.from(new Set(items))
  }

  const extraerAdiciones = (txtNorm: string) => {
    let extraPrecio = 0
    const nombresAdicion: string[] = []
    const matchInicioAdicion = txtNorm.match(
      /\b(adicion|adicional|extra|mas|agrega(?:le|rle|les)?|ponle[s]?|echale[s]?)\b|\+|^(?:una?|uno|1)?\s*con\s+/i
    )
    if (matchInicioAdicion && matchInicioAdicion.index !== undefined) {
      // Tomar únicamente desde donde empieza la frase de adición y excluir cualquier cláusula "sin ..."
      const zonaAdicion = txtNorm
        .slice(matchInicioAdicion.index)
        .replace(/\b(?:sin|nada de|no le eche[n]?|qu[ií]ta(?:le|rle|les|nle)?)\s+[a-z]+(?:\s+(?:ni|y|,)?\s*[a-z]+){0,3}/gi, '')
      for (const ad of adicionesDisponibles) {
        const nombreBase = ad.nombre
          .replace(/^porci[oó]n\s+de\s+/i, '')
          .replace(/\s*\(.*?\)/g, '')
          .trim()
        const adNorm = normalizarTextoWA(nombreBase)
        const tokenAd = singularizarPalabra(adNorm)
        if (
          adNorm &&
          (zonaAdicion.includes(adNorm) || (tokenAd.length >= 4 && zonaAdicion.includes(tokenAd)))
        ) {
          extraPrecio += ad.precio
          nombresAdicion.push(`${nombreBase} (+$${ad.precio.toLocaleString('es-CO')})`)
        }
      }
    }
    return { extraPrecio, nombresAdicion }
  }

  // 5. Analizar línea por línea para separar Datos del Cliente vs Líneas de Productos
  const lineasNoProducto: string[] = []

  for (const linea of lineasLimpias) {
    const lNorm = normalizarTextoWA(linea)

    // Etiquetas explícitas o frases naturales de Nombre ("Soy ...", "A nombre de ...", "Habla con ...", "Nombre: ...", "👤 Sandra")
    const matchNombre =
      linea.match(
        /(?:^|\b)(?:[👤🙋🧑👨👩]?\s*(?:nombre|cliente|a\s+nombre\s+de|recibe|mi\s+nombre\s+es|hablas?\s+con|soy))\s*[:\-]?\s*((?:doña|dona|don|sra\.?|sr\.?)?\s*[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)\b/i
      ) ||
      linea.match(/^(?:[👤🙋🧑👨👩]\s*)([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)/i) ||
      linea.match(/^(?:nombre|cliente|a nombre de|recibe)\s*[:\-]?\s*(.+)$/i)
    if (matchNombre) {
      const nombreCandidato = matchNombre[1]
        .replace(
          /\b(cel|celular|tel|telefono|calle|cra|carrera|cll|barrio|pago|para|en|de\s+la\s+calle|del\s+barrio|mira|es\s+para).*$/i,
          ''
        )
        .trim()
      if (
        nombreCandidato &&
        !/\b(hamburguesa|hamb|perro|salchipapa|calle|carrera|cra|cll|mandame|mándame|m[aá]ndeme|regalame|regálame|quiero|pedido|orden|porfa|gracias)\b/i.test(
          nombreCandidato
        )
      ) {
        if (!resultado.nombreCliente) {
          resultado.nombreCliente = nombreCandidato
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        }
        if (
          /^(?:[👤🙋🧑👨👩]?\s*(?:nombre|cliente|a\s+nombre\s+de|recibe))\s*[:\-]?\s*[^,\n]+$/i.test(linea.trim()) &&
          !/\b(calle|cra|cll|kr|diagonal|transversal|avenida|cel|tel)\b/i.test(linea)
        ) {
          continue
        }
      }
    }

    const matchTelLinea = linea.match(/^(?:tel(?:efono|éfono)?|cel(?:ular)?|whatsapp|numero|número)\s*[:\-]?\s*(.+)$/i)
    if (matchTelLinea) {
      const digitos = matchTelLinea[1].replace(/\D/g, '')
      if (digitos.length >= 7) {
        resultado.telefono = digitos.slice(-10)
      }
      continue
    }

    const regexDirCol =
      /\b((?:calle|cll|carrera|cra|kr|diagonal|diag|transversal|tv|avenida|av)\s+\d+[a-z]?\s*(?:bis)?\s*(?:#|no\.?|num\.?|numero)?\s*\d+[a-z]?\s*(?:-\s*\d+)?(?:\s+(?:sur|norte|este|oeste))?|(?:manzana|mz)\s+[a-z0-9]+\s+(?:casa|lote)\s+\d+)\b/i

    const matchDir = linea.match(/^(?:direcci[oó]n|dir|entrega en|enviar a|para enviar a)\s*[:\-]?\s*(.+)$/i)
    if (matchDir) {
      const contenidoDir = matchDir[1].trim()
      const subMatchCol = contenidoDir.match(regexDirCol)
      if (subMatchCol) {
        resultado.direccion = subMatchCol[1].trim()
        const resto = contenidoDir.slice(subMatchCol.index! + subMatchCol[0].length).trim()
        if (resto.length >= 3) {
          resultado.referencia = resultado.referencia ? `${resultado.referencia} | ${resto}` : resto
        }
      } else {
        resultado.direccion = contenidoDir
      }
      continue
    }

    const matchBarrio = linea.match(
      /^(?:barrio|referencia|ref|conjunto|edificio|apto|apartamento)\s*[:\-]\s*(.+)$/i
    )
    if (matchBarrio) {
      resultado.referencia = resultado.referencia
        ? `${resultado.referencia} - ${matchBarrio[1].trim()}`
        : matchBarrio[1].trim()
      continue
    }

    const matchDomi = linea.match(/^(?:domicilio|env[ií]o|valor domicilio)\s*[:\-]\s*\$?\s*([\d.,]+)$/i)
    if (matchDomi) {
      const val = Number(matchDomi[1].replace(/[.,]/g, ''))
      if (val >= 500) resultado.montoDomicilio = val <= 50 ? val * 1000 : val
      continue
    }

    const matchPagoLinea = linea.match(/^(?:medio de pago|metodo de pago|pago|forma de pago)\s*[:\-]/i)
    if (matchPagoLinea) {
      continue
    }

    // Si la línea parece una dirección colombiana ("Calle 12 # 4-50", "Cra 8 # 15-20", "Mz B Casa 4", "Vereda ...")
    const matchDirCol = linea.match(regexDirCol)
    const matchRural = linea.match(/\b(vereda\s+[a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)?)\b/i)
    const pareceDireccion =
      matchDirCol !== null ||
      matchRural !== null ||
      /\b(calle|cll|carrera|cra|kr|diagonal|diag|transversal|tv|avenida|av|manzana|mz)\s+[0-9a-z]/i.test(
        lNorm
      ) ||
      /(?:calle|cra|carrera|cll|kr).*#/i.test(lNorm)

    // Pero si la línea TAMBIÉN tiene productos (ej: un párrafo corrido con "dos hamb tocineta... calle 28 # 14-30"),
    // NO debemos saltarla completa con continue; primero se extrae la dirección y se procesan los productos
    if (pareceDireccion && !resultado.direccion) {
      if (matchDirCol) {
        resultado.direccion = matchDirCol[1].trim()
        const posFinDir = matchDirCol.index! + matchDirCol[0].length
        const restoLinea = linea.slice(posFinDir).trim()
        if (restoLinea) {
          const refLimpia = restoLinea
            .replace(
              /\b(?:pago|medio de pago|forma de pago)\s*(?:por|con)?\s*(?:nequi|bancolombia|daviplata|efectivo|transferencia|plata).*$/i,
              ''
            )
            .replace(/^[-–—|,.]\s*/, '')
            .trim()
          if (refLimpia.length >= 3 && !resultado.referencia.includes(refLimpia)) {
            resultado.referencia = resultado.referencia
              ? `${resultado.referencia} | ${refLimpia}`
              : refLimpia
          }
        }
      } else if (matchRural) {
        resultado.direccion = matchRural[1].trim()
        const posFinRural = matchRural.index! + matchRural[0].length
        const restoRural = linea.slice(posFinRural).trim()
        if (restoRural) {
          const refLimpia = restoRural
            .replace(
              /\b(?:pago|medio de pago|forma de pago|a\s+nombre\s+de|cel\b|tel\b).*$/i,
              ''
            )
            .replace(/^[-–—|,.]\s*/, '')
            .trim()
          if (refLimpia.length >= 3 && !resultado.referencia.includes(refLimpia)) {
            resultado.referencia = resultado.referencia
              ? `${resultado.referencia} | ${refLimpia}`
              : refLimpia
          }
        }
      } else {
        const dirSinPrefijo = linea
          .replace(/^(?:es\s+en\s+la|en\s+la|para\s+la|direcci[oó]n\s*[:\-]?)\s*/i, '')
          .trim()
        resultado.direccion = dirSinPrefijo
      }

      // Si la línea NO contiene platos, saltamos. Pero si contiene platos, continuamos para extraerlos
      const contienePlatos = REGEX_PRODUCTOS_GENERAL.test(lNorm)
      if (!contienePlatos) {
        continue
      }
    }

    // Si la línea empieza o contiene indicaciones de casa/barrio/piso sin ser producto
    if (
      /\b(barrio|b\/|conjunto|torre|apto|apartamento|casa\s+de|rejas|segundo\s+piso|primer\s+piso|tercer\s+piso|2do\s+piso|3er\s+piso|timbrar)\b/i.test(
        lNorm
      ) &&
      !REGEX_PRODUCTOS_GENERAL.test(lNorm)
    ) {
      const refLimpia = linea
        .replace(/^(?:es\s+para\s+ac[aá]\s+para\s+el|es\s+en\s+el|para\s+el|en\s+el)\s+/i, '')
        .trim()
      resultado.referencia = resultado.referencia
        ? `${resultado.referencia} | ${refLimpia}`
        : refLimpia
      continue
    }

    // ANTES de crear un producto nuevo: verificar si esta línea es una CORRECCIÓN / ADICIÓN / EXCLUSIÓN
    // sobre un producto que el cliente acaba de pedir en una línea anterior
    // Ej: "Ah pero a los maicitos agrégales adición de queso" o "Pero una sin cebolla"
    const mencionaSoloUno =
      /\b(pero\s+una?|solo\s+a?\s*una?|a\s+uno\s+de|una?\s+de\s+las|uno\s+de\s+los|una?\s+sola?|1\s+sin|1\s+con)\b/i.test(
        lNorm
      )

    const pareceModificacionDeAnterior =
      resultado.items.length > 0 &&
      (mencionaSoloUno ||
        (!/\b(\d+|un|una|uno|dos|tres|cuatro|otro|otra|tambien|también|ademas|además|regalame|regálame|mandame|mándame|me\s+manda[s]?|me\s+regala[s]?)\b/i.test(
          lNorm
        ) &&
          (/^(?:ah\s+)?(?:pero\s+)?(?:a\s+(?:la|el|los|las)|la\s+|el\s+|los\s+|las\s+|ese\s+|esa\s+|esos\s+|esas\s+)/i.test(
            lNorm
          ) ||
            /\b(agregale[s]?|agrégale[s]?|ponle[s]?|echale[s]?|échale[s]?|quitale[s]?|quítale[s]?)\b/i.test(
              lNorm
            ))))

    if (pareceModificacionDeAnterior) {
      const sinMod = extraerExclusiones(linea)
      const { extraPrecio, nombresAdicion } = extraerAdiciones(lNorm)

      if (sinMod.length > 0 || nombresAdicion.length > 0) {
        // Buscar a cuál de los ítems ya agregados se refiere (o al último si no especifica)
        let itemObjetivo = resultado.items[resultado.items.length - 1]
        for (let i = resultado.items.length - 1; i >= 0; i--) {
          const it = resultado.items[i]
          const tokensProd = normalizarTextoWA(it.producto.nombre)
            .split(/\s+/)
            .map((t) => singularizarPalabra(t))
            .filter((t) => t.length >= 3)
          if (tokensProd.some((tk) => lNorm.includes(tk))) {
            itemObjetivo = it
            break
          }
        }

        const nuevasPartesObs: string[] = []
        if (sinMod.length > 0) {
          nuevasPartesObs.push(`[!] SIN: ${sinMod.join(', ')}`)
        }
        if (nombresAdicion.length > 0) {
          nuevasPartesObs.push(`+ ADICIÓN: ${nombresAdicion.join(', ')}`)
        }

        // Si el ítem tenía cantidad >= 2 y el cliente dijo "pero una sin..." / "a uno...",
        // dividimos automáticamente: (N-1) normales + 1 con la modificación
        if (mencionaSoloUno && itemObjetivo.cantidad > 1) {
          itemObjetivo.cantidad -= 1
          const obsCombinadas = itemObjetivo.observaciones
            ? `${itemObjetivo.observaciones} | ${nuevasPartesObs.join(' | ')}`
            : nuevasPartesObs.join(' | ')
          resultado.items.push({
            idTemp: `wa-split-${itemObjetivo.producto.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            producto: {
              ...itemObjetivo.producto,
              precio: itemObjetivo.producto.precio + extraPrecio,
            },
            cantidad: 1,
            observaciones: obsCombinadas,
            lineaOriginal: linea.trim(),
          })
        } else {
          const obsActuales = itemObjetivo.observaciones ? [itemObjetivo.observaciones] : []
          obsActuales.push(...nuevasPartesObs)
          itemObjetivo.producto.precio += extraPrecio
          itemObjetivo.observaciones = obsActuales.join(' | ')
        }
        continue
      }
    }

    // Intentar detectar productos en la línea
    const lineaSinPrefijo = linea.replace(
      /^(?:hola|buen[ao]s\s+(?:d[ií]as|tardes|noches)|buenas|cordial\s+saludo|mira\s+|para\s+pedir|quiero\s+pedir|me\s+gustar[ií]a\s+pedir|me\s+van\s+preparando|pedido|orden|quiero|me\s+regala[s]?|reg[aá]lame|me\s+manda[s]?|mandame|mándame|por\s+fa(?:vor)?|tambien|también|ademas|además|y\s+también|ah\s+y)+\s*[:\-]?\s*/i,
      ''
    )
    const subSegmentos = lineaSinPrefijo.split(
      /(?:\s+y\s+|\s*,\s*|\s+(?=(?:\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b\s+(?:hamb|hamburguesa|perro|perra|salchipapa|salchi|chori|picada|minipoli|granpoli|arepa|papa|porcion|chuzo|pechuga|chuleta|costichi|churrasco|patacon|maicito|coca|gaseosa|pepsi|postobon|manzana|colombiana|quatro|sprite|agua|jugo|cerveza|refresco|alitas|descarada|ranchera)))(?=(?:(?:\d+|un|una|uno|dos|tres|cuatro|cinco)\b(?!\s+(?:sin|con|normal|normales|asi|sola|solo)\b)|hamburguesa|hamb\b|perro|perra|salchipapa|salchi\b|chori|minipoli|granpoli|arepa|papa|porcion|chuzo|pechuga|chuleta|costichi|churrasco|patacon|maicito|coca|gaseosa|pepsi|postobon|manzana|colombiana|quatro|sprite|agua|jugo|cerveza|refresco))/i
    )

    let detectoAlgunProductoEnLinea = false

    for (const seg of subSegmentos) {
      const segNorm = normalizarTextoWA(seg)
      if (!segNorm) continue

      // Aislar el nombre del plato quitando las cláusulas de exclusión ("sin..."), adición ("con adición de...") y pago ("pago por...")
      // para que un ingrediente excluido o adicionado jamás se confunda con otro plato del menú
      const segPlatoNorm =
        segNorm
          .replace(/\b(?:una?|uno|1)\s+(?:sin|con)\b.*$/i, '')
          .replace(/\b(?:sin|nada de|no le eche[n]?|qu[ií]ta(?:le|rle|les|nle)?)\b.*$/i, '')
          .replace(/\b(?:con\s+)?(?:adicion|adicional|extra)\b.*$/i, '')
          .replace(/\b(?:pago|cancelo|medio de pago)\b.*$/i, '')
          .trim() || segNorm

      let mejorMatch: { producto: Producto; puntaje: number } | null = null

      for (const itemIdx of productosIndexados) {
        if (itemIdx.tokens.length === 0) continue

        if (segPlatoNorm.includes(itemIdx.norm)) {
          const puntajeExacto = itemIdx.tokens.length * 10 + itemIdx.norm.length
          if (!mejorMatch || puntajeExacto > mejorMatch.puntaje) {
            mejorMatch = { producto: itemIdx.producto, puntaje: puntajeExacto }
          }
          continue
        }

        // Si coincide exactamente con alguno de los alias manuales definidos para el producto
        if (itemIdx.aliasList && itemIdx.aliasList.some((al) => segPlatoNorm.includes(al))) {
          const puntajeAlias = 30 + itemIdx.norm.length
          if (!mejorMatch || puntajeAlias > mejorMatch.puntaje) {
            mejorMatch = { producto: itemIdx.producto, puntaje: puntajeAlias }
          }
          continue
        }

        const palabrasSeg = segPlatoNorm
          .split(/[\s\-]+/)
          .map((w) => singularizarPalabra(w.replace(/[^a-z0-9]/g, '')))
          .filter(Boolean)

        // Expandir palabras del segmento con sinónimos (ej: "coca" -> expande a "coca cola", "hamb" -> "hamburguesa")
        const palabrasExpandidas = new Set(palabrasSeg)
        for (const pSeg of palabrasSeg) {
          const alias = SINONIMOS_PRODUCTOS[pSeg]
          if (alias) {
            alias.forEach((a) => {
              a.split(/\s+/).forEach((w) => palabrasExpandidas.add(singularizarPalabra(w)))
            })
          }
        }

        let coincidencias = 0
        for (const tk of itemIdx.tokens) {
          if (
            palabrasExpandidas.has(tk) ||
            Array.from(palabrasExpandidas).some((ps) => tk.length >= 5 && ps.startsWith(tk))
          ) {
            coincidencias++
          }
        }

        const ratio = coincidencias / itemIdx.tokens.length
        if (
          (itemIdx.tokens.length === 1 && coincidencias === 1) ||
          (itemIdx.tokens.length >= 2 && coincidencias >= 2) ||
          ratio >= 0.75
        ) {
          const puntaje = coincidencias * 8 + ratio * 5
          if (!mejorMatch || puntaje > mejorMatch.puntaje) {
            mejorMatch = { producto: itemIdx.producto, puntaje }
          }
        }
      }

      if (mejorMatch) {
        detectoAlgunProductoEnLinea = true
        const prod = mejorMatch.producto

        // 1. Extraer cantidad
        let cantidad = 1
        const matchCantInicio = segNorm.match(
          /^(?:(\d{1,2})|(un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez))\b/i
        )
        if (matchCantInicio) {
          if (matchCantInicio[1]) {
            cantidad = Number(matchCantInicio[1])
          } else if (matchCantInicio[2] && MAPA_NUMEROS_TEXTO[matchCantInicio[2].toLowerCase()]) {
            cantidad = MAPA_NUMEROS_TEXTO[matchCantInicio[2].toLowerCase()]
          }
        } else {
          const matchCantNum = segNorm.match(/(?:^|\b)(\d{1,2})\s*(?:x\b|unidades?\b|porciones?\b)?/)
          if (matchCantNum && Number(matchCantNum[1]) >= 1 && Number(matchCantNum[1]) <= 30) {
            cantidad = Number(matchCantNum[1])
          } else {
            const matchPrevia = segNorm.match(
              /(?:^|\b)(\d{1,2}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(?:hamb|perro|salchi|chori|picada|mini|gran|arepa|papa|maicito|coca|gaseosa)/i
            )
            if (matchPrevia) {
              const tok = matchPrevia[1].toLowerCase()
              if (/^\d+$/.test(tok)) {
                cantidad = Number(tok)
              } else if (MAPA_NUMEROS_TEXTO[tok]) {
                cantidad = MAPA_NUMEROS_TEXTO[tok]
              }
            } else {
              for (const [palNum, valorNum] of Object.entries(MAPA_NUMEROS_TEXTO)) {
                if (new RegExp(`(?:^|\\b)${palNum}\\b`, 'i').test(segNorm)) {
                  cantidad = valorNum
                  break
                }
              }
            }
          }
        }

        // 2. Extraer exclusiones y adiciones
        const matchCarne = segNorm.match(/\b(?:carne\s+de\s+|de\s+)?(res|pollo|cerdo|mixta)\b/i)
        const carneObs =
          matchCarne &&
          /hamburguesa|arepaburguer|descarada|ranchera|polichinelo/i.test(prod.nombre) &&
          !normalizarTextoWA(prod.nombre).includes(matchCarne[1].toLowerCase())
            ? `CARNE: ${matchCarne[1].charAt(0).toUpperCase() + matchCarne[1].slice(1).toLowerCase()}`
            : null

        // Verificar si el cliente pidió múltiples unidades con modificaciones diferentes dentro del mismo segmento
        // Ej: "dos hamb tocineta una sin ensalada y la otra normal"
        // Ej: "dos hamb tocineta una sin ensalada y la otra sin ripio"
        const matchSplitNormal =
          cantidad >= 2
            ? segNorm.match(
                /\b(?:una?|uno|1)\s+((?:sin|con)\s+[a-z,\s]+?)\s+y\s+(?:(?:la|el)\s+)?(?:otra|otro|las\s+otras|los\s+otros)\s+normal(?:es|ita|itas|ito|itos)?\b/i
              )
            : null

        const matchSplitDoble =
          cantidad >= 2
            ? segNorm.match(
                /\b(?:una?|uno|1)\s+((?:sin|con)\s+[a-z,\s]+?)\s+y\s+(?:(?:la|el)\s+)?(?:otra|otro|una?|uno|1)\s+((?:sin|con)\s+[a-z,\s]+)\b/i
              )
            : null

        if (matchSplitNormal) {
          const modTexto = matchSplitNormal[1]
          const sinMod = extraerExclusiones(modTexto)
          const { extraPrecio: epMod, nombresAdicion: naMod } = extraerAdiciones(modTexto)
          const obsMod: string[] = []
          if (carneObs) obsMod.push(carneObs)
          if (sinMod.length > 0) obsMod.push(`[!] SIN: ${sinMod.join(', ')}`)
          if (naMod.length > 0) obsMod.push(`+ ADICIÓN: ${naMod.join(', ')}`)

          // 1 unidad modificada
          resultado.items.push({
            idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            producto: {
              ...prod,
              precioBase: prod.precio,
              precio: prod.precio + epMod,
            },
            cantidad: 1,
            observaciones: obsMod.join(' | '),
            lineaOriginal: seg.trim(),
          })

          // (cantidad - 1) unidades normales
          const obsNormal: string[] = []
          if (carneObs) obsNormal.push(carneObs)
          resultado.items.push({
            idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            producto: {
              ...prod,
              precioBase: prod.precio,
              precio: prod.precio,
            },
            cantidad: cantidad - 1,
            observaciones: obsNormal.join(' | '),
            lineaOriginal: seg.trim(),
          })
        } else if (matchSplitDoble) {
          const modTexto1 = matchSplitDoble[1]
          const modTexto2 = matchSplitDoble[2]

          const sinMod1 = extraerExclusiones(modTexto1)
          const { extraPrecio: epMod1, nombresAdicion: naMod1 } = extraerAdiciones(modTexto1)
          const obsMod1: string[] = []
          if (carneObs) obsMod1.push(carneObs)
          if (sinMod1.length > 0) obsMod1.push(`[!] SIN: ${sinMod1.join(', ')}`)
          if (naMod1.length > 0) obsMod1.push(`+ ADICIÓN: ${naMod1.join(', ')}`)

          const sinMod2 = extraerExclusiones(modTexto2)
          const { extraPrecio: epMod2, nombresAdicion: naMod2 } = extraerAdiciones(modTexto2)
          const obsMod2: string[] = []
          if (carneObs) obsMod2.push(carneObs)
          if (sinMod2.length > 0) obsMod2.push(`[!] SIN: ${sinMod2.join(', ')}`)
          if (naMod2.length > 0) obsMod2.push(`+ ADICIÓN: ${naMod2.join(', ')}`)

          resultado.items.push({
            idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            producto: {
              ...prod,
              precioBase: prod.precio,
              precio: prod.precio + epMod1,
            },
            cantidad: 1,
            observaciones: obsMod1.join(' | '),
            lineaOriginal: seg.trim(),
          })

          resultado.items.push({
            idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            producto: {
              ...prod,
              precioBase: prod.precio,
              precio: prod.precio + epMod2,
            },
            cantidad: 1,
            observaciones: obsMod2.join(' | '),
            lineaOriginal: seg.trim(),
          })

          if (cantidad > 2) {
            const obsNormal: string[] = []
            if (carneObs) obsNormal.push(carneObs)
            resultado.items.push({
              idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              producto: {
                ...prod,
                precioBase: prod.precio,
                precio: prod.precio,
              },
              cantidad: cantidad - 2,
              observaciones: obsNormal.join(' | '),
              lineaOriginal: seg.trim(),
            })
          }
        } else {
          const partesObservacion: string[] = []
          if (carneObs) partesObservacion.push(carneObs)

          const listaSin = extraerExclusiones(seg)
          if (listaSin.length > 0) {
            partesObservacion.push(`[!] SIN: ${listaSin.join(', ')}`)
          }

          const { extraPrecio, nombresAdicion } = extraerAdiciones(segNorm)
          if (nombresAdicion.length > 0) {
            partesObservacion.push(`+ ADICIÓN: ${nombresAdicion.join(', ')}`)
          }

          const precioUnitarioFinal = prod.precio + extraPrecio

          resultado.items.push({
            idTemp: `wa-${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            producto: {
              ...prod,
              precioBase: prod.precio,
              precio: precioUnitarioFinal,
            },
            cantidad,
            observaciones: partesObservacion.join(' | '),
            lineaOriginal: seg.trim(),
          })
        }
      }
    }

    // Si la línea NO tenía nombre de plato, pero tiene "sin cebolla / sin salsas / con adición de queso"
    // aplicárselo al último producto detectado (típico cliente que manda la nota en el mensaje siguiente)
    if (!detectoAlgunProductoEnLinea && resultado.items.length > 0) {
      const ultimoItem = resultado.items[resultado.items.length - 1]
      const sinExtra = extraerExclusiones(linea)
      const { extraPrecio, nombresAdicion } = extraerAdiciones(lNorm)

      if (sinExtra.length > 0 || nombresAdicion.length > 0) {
        const obsActuales = ultimoItem.observaciones ? [ultimoItem.observaciones] : []
        if (sinExtra.length > 0) {
          obsActuales.push(`[!] SIN: ${sinExtra.join(', ')}`)
        }
        if (nombresAdicion.length > 0) {
          obsActuales.push(`+ ADICIÓN: ${nombresAdicion.join(', ')}`)
          ultimoItem.producto.precio += extraPrecio
        }
        ultimoItem.observaciones = obsActuales.join(' | ')
        continue
      }
    }

    if (!detectoAlgunProductoEnLinea) {
      const soloDigitos = linea.replace(/\D/g, '')
      if (soloDigitos.length >= 9 && soloDigitos.length <= 12) continue

      lineasNoProducto.push(linea)
    }
  }

  // Si aún no hay nombreCliente, usar el nombre del remitente del encabezado de WhatsApp o una línea corta limpia
  if (!resultado.nombreCliente && nombreRemitenteChat) {
    resultado.nombreCliente = nombreRemitenteChat
  }

  for (const l of lineasNoProducto) {
    const lNorm = normalizarTextoWA(l)
    if (
      !resultado.nombreCliente &&
      l.length >= 3 &&
      l.length <= 35 &&
      !/\b(hola|buenas|noches|tardes|dias|gracias|pedido|orden|mandame|mándame|m[aá]ndeme|regalame|regálame|quiero|porfa|favor|efectivo|nequi|bancolombia|transferencia|servicio|tienen|cuanto|demora|mismo|otra\s+vez|siempre)\b/i.test(
        lNorm
      )
    ) {
      resultado.nombreCliente = l.trim()
    }
  }

  return resultado
}

export function generarTextoResumenWhatsApp(params: {
  consecutivo?: string
  tipoPedido: string
  nombreCliente?: string
  telefono?: string
  direccion?: string
  referencia?: string
  items: Array<{
    cantidad: number
    nombre: string
    subtotal: number
    observaciones?: string
  }>
  costoDomicilio?: number
  total: number
  metodoPago?: string
  bancoNombre?: string
}): string {
  const fmt = (n: number) => Math.round(n).toLocaleString('es-CO')
  const lineas: string[] = []

  if (params.consecutivo) {
    lineas.push(`*POLICHINELO - Pedido #${params.consecutivo}*`)
  } else {
    lineas.push(`*POLICHINELO - Confirmación de Pedido*`)
  }

  lineas.push(`Modalidad: *${params.tipoPedido}*`)
  if (params.nombreCliente?.trim()) {
    lineas.push(`Cliente: ${params.nombreCliente.trim()}`)
  }
  if (params.direccion?.trim()) {
    lineas.push(
      `Dirección: ${params.direccion.trim()}${
        params.referencia?.trim() ? ` (${params.referencia.trim()})` : ''
      }`
    )
  }

  lineas.push('')
  lineas.push('*Detalle del pedido:*')
  for (const it of params.items) {
    lineas.push(`• ${it.cantidad}x ${it.nombre} — $${fmt(it.subtotal)}`)
    if (it.observaciones?.trim()) {
      const obsLimpia = it.observaciones
        .replace(/^\[LIBRE:\s*[^\]]+\]\s*(\|\s*)?/i, '')
        .trim()
      if (obsLimpia) {
        lineas.push(`   _${obsLimpia}_`)
      }
    }
  }

  if (params.costoDomicilio && params.costoDomicilio > 0) {
    lineas.push(`• Domicilio: $${fmt(params.costoDomicilio)}`)
  }

  lineas.push('')
  const infoPago = params.bancoNombre
    ? `${params.metodoPago || 'Transferencia'} (${params.bancoNombre})`
    : params.metodoPago || 'Efectivo'
  lineas.push(`*TOTAL A PAGAR: $${fmt(params.total)}*`)
  lineas.push(`Medio de pago: ${infoPago}`)

  return lineas.join('\n')
}

export function generarTextoResumenDesdeTicket(datos: DatosComandaCocina): string {
  return generarTextoResumenWhatsApp({
    consecutivo: datos.consecutivo !== undefined ? String(datos.consecutivo) : undefined,
    tipoPedido: datos.tipoPedido,
    nombreCliente: datos.cliente?.nombre,
    telefono: datos.cliente?.telefono,
    direccion: datos.cliente?.direccion,
    referencia: datos.cliente?.referenciaDireccion,
    items: (datos.items || []).map((it: any) => ({
      cantidad: it.cantidad,
      nombre: it.nombre || it.producto?.nombre || 'Producto',
      subtotal: it.subtotal,
      observaciones: it.observaciones,
    })),
    costoDomicilio: datos.costoDomicilio,
    total: datos.total,
    metodoPago: datos.metodoPago,
    bancoNombre: datos.bancoNombre,
  })
}

export function generarTextoResumenDesdeCarrito(params: {
  carrito: ItemCarrito[]
  tipoPedido: TipoPedido
  nombreCliente: string
  telefono: string
  direccion: string
  referencia: string
  montoDomicilio: number
  total: number
  metodoPago?: MetodoPago | null
  bancoNombre?: string
}): string {
  return generarTextoResumenWhatsApp({
    tipoPedido: params.tipoPedido,
    nombreCliente: params.nombreCliente,
    telefono: params.telefono,
    direccion: params.direccion,
    referencia: params.referencia,
    items: params.carrito.map((it) => ({
      cantidad: it.cantidad,
      nombre: it.producto.nombre,
      subtotal: (it.producto.precio || 0) * it.cantidad,
      observaciones: it.observaciones,
    })),
    costoDomicilio: params.tipoPedido === 'DOMICILIO' ? params.montoDomicilio : 0,
    total: params.total,
    metodoPago: params.metodoPago?.nombre || 'Efectivo',
    bancoNombre: params.metodoPago?.requiereBanco ? params.bancoNombre : undefined,
  })
}
