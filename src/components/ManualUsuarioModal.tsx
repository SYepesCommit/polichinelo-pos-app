import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  X,
  ShoppingCart,
  Receipt,
  TrendingDown,
  Package,
  HelpCircle,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Printer,
  Banknote,
  Smartphone,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Search,
  Copy,
  Power,
  Moon,
  CloudUpload,
  FolderOpen,
  KeyRound,
  Calculator,
  Eye,
  Trophy,
} from 'lucide-react'

interface ManualUsuarioModalProps {
  onCerrar: () => void
}

type SeccionManual =
  | 'pos'
  | 'caja'
  | 'salidas'
  | 'productos'
  | 'seguridad'
  | 'tecnico'
  | 'faq'

interface FaqItem {
  categoria: string
  pregunta: string
  respuesta: string
  pasos?: string[]
}

const LISTA_FAQ_COMPLETA: FaqItem[] = [
  {
    categoria: 'Caja y Pagos',
    pregunta: '¿Qué hago si cobré un pedido en Efectivo pero el cliente terminó pagando por Nequi (o al revés)?',
    respuesta:
      'No necesitas anular el pedido ni volverlo a hacer. Puedes cambiarle el método de pago directamente desde el Histórico.',
    pasos: [
      'Entra a Pedidos / Histórico con el PIN de supervisor.',
      'Busca el pedido en la lista y toca el ícono de billetera / tarjeta ("Cambiar método de pago").',
      'Selecciona Transferencia y elige el banco (ej. Nequi), o cámbialo a Efectivo.',
      'Al guardar, el cuadre de Efectivo en Caja y el de Bancos se actualizarán automáticamente.',
    ],
  },
  {
    categoria: 'Caja y Pagos',
    pregunta: '¿Qué hago si un cliente paga una parte en Efectivo y otra parte por Nequi?',
    respuesta:
      'Registra el pedido con el método principal (por ejemplo Efectivo) y deja una nota en "Notas del pedido" indicando cuánto entró por transferencia, o registra la diferencia como ajuste para tener claridad al contar la gaveta.',
  },
  {
    categoria: 'Domicilios y Clientes',
    pregunta: '¿Qué hago si un cliente de domicilio ya existía pero se mudó a otra dirección?',
    respuesta:
      'El sistema actualiza automáticamente los datos del cliente cuando cobras el pedido.',
    pasos: [
      'En modo Domicilio, escribe el teléfono del cliente y toca la lupa 🔍.',
      'Borra la dirección vieja y escribe la dirección y referencia nuevas.',
      'Al presionar COBRAR PEDIDO, la nueva dirección quedará guardada para sus próximos pedidos y en el recibo impreso.',
    ],
  },
  {
    categoria: 'Domicilios y Clientes',
    pregunta: '¿El valor del domicilio suma al Total Facturado y al Efectivo en Caja?',
    respuesta:
      'Sí. El valor del domicilio se suma al total que paga el cliente. Además, en la tarjeta "Domicilios" del Histórico verás por separado cuánto dinero corresponde únicamente a envíos (ej. "$35.000 en envíos") para saber cuánto liquidarle a los domiciliarios.',
  },
  {
    categoria: 'Domicilios y Clientes',
    pregunta: '¿Cuando le pago los envíos al domiciliario debo registrarlo como Salida?',
    respuesta:
      '¡Sí! Si sacas billetes de la registradora para pagarle las carreras al domiciliario, entra a Histórico -> Registrar Salida -> elige "Efectivo de Caja" -> categoría "Pago Domiciliario" y pon el monto entregado. Así el Efectivo en Caja descontará ese dinero y cuadrará exacto con tus billetes.',
  },
  {
    categoria: 'Turnos y Horarios',
    pregunta: '¿Qué pasa si cerramos tarde y cobramos pedidos después de las 12:00 a. m. (medianoche)?',
    respuesta:
      'El sistema tiene "Protección de Turno Nocturno" con corte a las 04:00 a. m. Todo pedido o salida registrado entre las 12:00 a. m. y las 3:59 a. m. se mantiene dentro del turno de la noche que estás trabajando, sin pasarse al día siguiente por accidente.',
  },
  {
    categoria: 'Pedidos y Cocina',
    pregunta: '¿Cómo cobro un producto con adición extra (ej. porción extra de queso o tocineta) subiendo el precio?',
    respuesta:
      'Al agregar el plato, toca el botón "Personalizar" (o toca el producto dentro de la comanda derecha). En esa ventana puedes escribir qué adición lleva y modificar el "Precio Unitario ($)" sumándole el valor de la adición antes de guardar.',
  },
  {
    categoria: 'Pedidos y Cocina',
    pregunta: '¿Cómo cobro algo que no existe en el menú (ej. un cobro especial o combo improvisado)?',
    respuesta:
      'En la parte superior del panel derecho (al lado del título "Comanda"), toca el botón "+". Ahí puedes escribir cualquier nombre de producto, cantidad, precio y observación sin tener que crearlo en el catálogo.',
  },
  {
    categoria: 'Pedidos y Cocina',
    pregunta: '¿Qué diferencia hay entre "Notas del pedido" (arriba) y la nota de un producto?',
    respuesta:
      'La nota de un producto (ej. "Sin cebolla") sale impresa justo debajo de ese plato específico para que cocina sepa cuál modificar. Las "Notas del pedido" (arriba en la cabecera) son instrucciones generales para toda la orden (ej. "Empacar todo separado", "Llevar devuelta de $50.000", "Entregar en portería").',
  },
  {
    categoria: 'Anulaciones y Errores',
    pregunta: '¿Qué pasa con el dinero cuando anulo una venta en el Histórico?',
    respuesta:
      'Al anular un pedido, su estado pasa a ANULADO (en rojo) y su valor se resta inmediatamente de Total Facturado, Efvo. Ventas, Bancos, Ranking de Productos y Domicilios. El registro no se borra para que quede constancia del motivo de anulación.',
  },
  {
    categoria: 'Anulaciones y Errores',
    pregunta: '¿Si anulé un pedido por equivocación, lo puedo recuperar?',
    respuesta:
      'Sí. Filtra por estado "Anulados" en el Histórico, ubica el pedido y toca el botón verde de restaurar (flecha circular). El pedido volverá a estado REALIZADO y su dinero volverá a sumar en la caja.',
  },
  {
    categoria: 'Salidas y Gastos',
    pregunta: '¿Por qué al registrar un gasto por Transferencia no baja el "Efvo. en Caja"?',
    respuesta:
      'Porque "Efvo. en Caja" representa los billetes y monedas físicos que deben estar dentro del cajón. Si pagaste un proveedor desde Nequi o Bancolombia, no sacaste billetes físicos del cajón. Por eso el sistema lo suma en "Salidas / Gastos" pero solo resta de "Efvo. en Caja" lo que haya salido en efectivo.',
  },
  {
    categoria: 'Impresora y Papel',
    pregunta: '¿Cómo puedo probar un pedido o revisar un ticket sin gastar papel térmico?',
    respuesta:
      'Cuando cobras un pedido y se abre la ventana de vista previa del recibo, no tienes que darle a "Imprimir Comanda". Puedes revisarlo en pantalla, darle a "Guardar PDF" si quieres conservarlo en el computador, o simplemente tocar "Cerrar" arriba a la derecha.',
  },
  {
    categoria: 'Impresora y Papel',
    pregunta: '¿Se acabó el rollo de papel justo cuando imprimí, cómo saco el recibo otra vez?',
    respuesta:
      'Pon el rollo nuevo, entra a Pedidos / Histórico, busca el pedido (el último siempre sale de primero arriba) y toca el ícono de impresora 🖨️ a la derecha.',
  },
  {
    categoria: 'Menú y Productos',
    pregunta: '¿Por qué al eliminar un producto me dice que "Se desactivó del menú" en vez de borrarse?',
    respuesta:
      'Si ese plato ya se vendió alguna vez en días o meses anteriores, el sistema protege la contabilidad para que los reportes viejos no pierdan el nombre del plato. Al desactivarlo, desaparece de la Caja POS pero conserva el historial intacto.',
  },
  {
    categoria: 'Backups y Seguridad',
    pregunta: '¿Cada cuánto se guarda copia de seguridad (Backup) de las ventas?',
    respuesta:
      'De Jueves a Domingo se guarda sola cada 30 minutos mientras vas cobrando pedidos, y además SIEMPRE hace un respaldo automático cuando cierras el programa desde la X. También puedes hacer un backup manual cualquier día desde el botón "Backups / Drive" del Dashboard.',
  },
  {
    categoria: 'Backups y Seguridad',
    pregunta: '¿Qué hago si olvidamos el PIN de supervisor y nadie puede entrar a Histórico o Productos?',
    respuesta:
      'Cierra Polichinelo POS. En el teclado de Windows presiona las teclas Windows + R, escribe %APPDATA%\\polichinelo-pos-app y presiona Enter. Borra el archivo llamado "seguridad-pin.json". Al volver a abrir el programa, el PIN volverá a ser el de fábrica: 1234.',
  },
]

export const ManualUsuarioModal: React.FC<ManualUsuarioModalProps> = ({ onCerrar }) => {
  const [seccionActiva, setSeccionActiva] = useState<SeccionManual>('pos')
  const [busquedaFaq, setBusquedaFaq] = useState('')

  const secciones: { id: SeccionManual; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'pos', label: '1. Hacer Pedidos', icon: ShoppingCart, color: 'text-amber-400' },
    { id: 'caja', label: '2. Cuadre e Histórico', icon: Receipt, color: 'text-sky-400' },
    { id: 'salidas', label: '3. Salidas / Gastos', icon: TrendingDown, color: 'text-rose-400' },
    { id: 'productos', label: '4. Menú y Carta', icon: Package, color: 'text-emerald-400' },
    { id: 'seguridad', label: '5. Backups y PIN', icon: ShieldCheck, color: 'text-amber-300' },
    { id: 'tecnico', label: '6. Soporte Técnico', icon: Wrench, color: 'text-orange-400' },
    { id: 'faq', label: '7. Preguntas (FAQ)', icon: HelpCircle, color: 'text-purple-400' },
  ]

  const faqsFiltradas = useMemo(() => {
    const q = busquedaFaq.trim().toLowerCase()
    if (!q) return LISTA_FAQ_COMPLETA
    return LISTA_FAQ_COMPLETA.filter(
      (item) =>
        item.pregunta.toLowerCase().includes(q) ||
        item.respuesta.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q) ||
        (item.pasos && item.pasos.some((p) => p.toLowerCase().includes(q)))
    )
  }, [busquedaFaq])

  const handleBuscarEnFaq = (texto: string) => {
    setBusquedaFaq(texto)
    if (texto.trim() && seccionActiva !== 'faq') {
      setSeccionActiva('faq')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* CABECERA CON BUSCADOR RÁPIDO */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                Manual Completo y Soporte · Polichinelo POS
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Guía operativa, contable y técnica integrada en el sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busquedaFaq}
                onChange={(e) => handleBuscarEnFaq(e.target.value)}
                placeholder="Buscar duda (ej. impresora, nequi, anular, pin...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
              {busquedaFaq && (
                <button
                  type="button"
                  onClick={() => setBusquedaFaq('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold uppercase tracking-wider transition active:scale-95 shrink-0"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PESTAÑAS / SECCIONES */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap gap-1.5 shrink-0">
          {secciones.map((sec) => {
            const Icon = sec.icon
            const activa = seccionActiva === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSeccionActiva(sec.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border transition active:scale-95 ${
                  activa
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activa ? 'text-slate-950' : sec.color}`} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* CONTENIDO DE LA SECCIÓN ACTIVA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* ==========================================
              SECCIÓN 1: HACER PEDIDOS (CAJA POS)
             ========================================== */}
          {seccionActiva === 'pos' && (
            <div className="space-y-5">
              {/* PASO 1: TIPO DE PEDIDO */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 1 · Cabecera Superior
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Seleccionar Modalidad del Pedido y Datos del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>1. Para Acá (Mesa)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      • <strong>Nombre del Cliente (Obligatorio):</strong> Siempre debes escribir el nombre para llamar al cliente cuando salga su plato (no usamos números de mesa).
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      • <strong>Notas del pedido:</strong> Úsalo para avisos generales (ej. <em>&quot;Entregar todo al tiempo&quot;</em>).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase">
                      <ShoppingBag className="w-4 h-4" />
                      <span>2. Para Llevar</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      • <strong>Nombre del Cliente (Obligatorio):</strong> Identifica de quién es el paquete en barra.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      • <strong>En el recibo:</strong> Imprime el encabezado <code>*** PARA LLEVAR ***</code> para que cocina lo empaque en contenedor/bolsa.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                      <Bike className="w-4 h-4" />
                      <span>3. Domicilio</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      • Escribe primero el <strong>Teléfono</strong> y toca la lupa 🔍 (o Enter).
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      • Si aparece el aviso verde <strong>Registrado</strong>, se llenan solos su Nombre, Dirección y Referencia. Si cambió de casa, edita la dirección ahí mismo y se actualizará al cobrar.
                    </p>
                  </div>
                </div>
              </div>

              {/* PASO 2: PRODUCTOS, PERSONALIZACIÓN Y ESPECIALES */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 2 · Catálogo y Personalización
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Agregar Platos, Quitar Ingredientes, Adiciones e Ítem Libre
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">
                        Botón &quot;+ Agregar&quot; (Rápido):
                      </strong>
                      Suma 1 unidad estándar del producto directo a la comanda. Si el producto ya estaba en la comanda sin notas especiales, aumenta su cantidad (<code>1x -&gt; 2x</code>).
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">
                        Botón &quot;Personalizar&quot; (Sin cebolla / Con adiciones):
                      </strong>
                      Abre la ventana donde puedes tocar ingredientes para quitarlos (ej. <em>SIN cebolla, SIN salsas</em>), agregar adiciones disponibles, escribir una nota para cocina o subir el <strong>Precio Unitario</strong> si lleva un extra cobrado.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Plus className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">
                        Ítem Libre (Botón &quot;+&quot; arriba en la Comanda):
                      </strong>
                      ¿Necesitas cobrar algo que no está en el menú? Toca el botón <strong>+</strong> al lado de la papelera en la cabecera de la comanda, ponle nombre, cantidad y precio.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">
                        Botón &quot;Plato del Día&quot;:
                      </strong>
                      Permite marcar platos existentes con la estrella de <em>Especial de Hoy</em> o crear un plato especial rápido que aparecerá en la pestaña <strong>⭐ Plato del Día</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 3: CALCULADORA DE DEVUELTA, BANCOS E IMPRESIÓN */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 3 · Cobro e Impresión Térmica
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Calculadora de Devuelta, Bancos y Comanda de 80mm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase">
                      <Calculator className="w-4 h-4" />
                      <span>Calculadora de Efectivo</span>
                    </div>
                    <p>
                      Al elegir <strong>Efectivo</strong>, escribe con cuánto paga el cliente en <em>&quot;Pagan con&quot;</em> o toca los billetes rápidos (<code>$10k</code>, <code>$20k</code>, <code>$50k</code>, <code>$100k</code>, <code>Exacto</code>). El sistema calcula la <strong>Devuelta</strong> y la imprime en el recibo (ideal para saber cuánto cambio mandarle con el domiciliario).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-black uppercase">
                      <Smartphone className="w-4 h-4" />
                      <span>Bancos y Billeteras</span>
                    </div>
                    <p>
                      Al elegir <strong>Transferencia</strong>, selecciona la cuenta destino (<strong>Nequi, Bancolombia, Daviplata, Bre-B</strong>). Con el botón <em>&quot;+ Nuevo&quot;</em> puedes crear otra entidad bancaria si abren una cuenta nueva.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase">
                      <Printer className="w-4 h-4" />
                      <span>Recibo Inteligente 80mm</span>
                    </div>
                    <p>
                      El recibo adapta su diseño automáticamente: si es <strong>Domicilio</strong> resalta en caja grande el Teléfono, Dirección, Referencia y Costo de Envío; si es <strong>Mesa/Llevar</strong> ahorra papel mostrando solo el cliente y los platos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 2: CUADRE DE CAJA E HISTÓRICO
             ========================================== */}
          {seccionActiva === 'caja' && (
            <div className="space-y-5">
              {/* FÓRMULA DE CAJA Y PROTECCIÓN DE MADRUGADA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase mb-2">
                    <Calculator className="w-4 h-4" />
                    <span>Fórmula Exacta del Efectivo en Caja</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    La tarjeta <strong>Efvo. en Caja</strong> te dice exactamente cuánto dinero en billetes y monedas debe haber en la gaveta física:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xs text-amber-300 font-bold">
                    Efvo. en Caja = Efvo. Ventas − Salidas en Efectivo
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    *Si además dejaste una base fija de monedas/billetes al abrir el turno (ej. $50.000 de base), en la gaveta tendrás: <strong>Base + Efvo. en Caja</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-sky-500/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase mb-2">
                    <Moon className="w-4 h-4" />
                    <span>Jornada Nocturna (Corte a las 04:00 a. m.)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    En restaurantes nocturnos es normal cerrar después de las 12:00 de la medianoche. Por eso Polichinelo POS corta la jornada a las <strong>04:00 a. m.</strong>:
                  </p>
                  <ul className="text-xs text-slate-400 mt-2 space-y-1 list-disc list-inside">
                    <li>Si cobras un pedido a las <strong>12:30 a. m.</strong> del domingo, sigue sumando en el cierre del <strong>Sábado en la noche</strong>.</li>
                    <li>Si entras a Histórico a la 1:00 a. m. y tocas <strong>Hoy</strong>, verás toda la noche que estás cerrando.</li>
                  </ul>
                </div>
              </div>

              {/* LAS TARJETAS INTERACTIVAS */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-3">
                  Tarjetas Interactivas (Tócalas para ver más detalles)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between text-purple-300 font-black uppercase">
                      <span>Bancos / Transf.</span>
                      <Eye className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-slate-300">
                      Al tocar esta tarjeta se abre el desglose exacto por entidad (cuántos pedidos y cuánto dinero entró a <strong>Nequi</strong>, cuánto a <strong>Bancolombia</strong>, etc.). Si tocas un banco ahí adentro, filtrará la lista de abajo para mostrarte solo los pedidos de ese banco.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-1">
                    <div className="flex items-center justify-between text-rose-400 font-black uppercase">
                      <span>Salidas / Gastos</span>
                      <Eye className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-slate-300">
                      Muestra cuánto salió de <strong>Caja</strong> (efectivo) y cuánto por <strong>Transferencia</strong>. Al tocarla verás la lista completa con fecha, hora exacta y botón para eliminar salidas erróneas (con PIN).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-amber-400 font-black uppercase">
                      <span>Productos Más Vendidos</span>
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-slate-300">
                      Al tocarla abre el <strong>Ranking Completo</strong> de todos los platos vendidos en el día, semana o mes, ordenados de mayor a menor, con unidades vendidas, dinero generado y ganancia estimada.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCIONES SOBRE VENTAS Y EXCEL */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-3">
                  Herramientas de la Lista de Ventas y Exportación a Excel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Cambiar Método de Pago sin Anular:</strong>
                      En cada fila de venta hay un ícono de billetera/tarjeta. Úsalo cuando el cliente cambió de Efectivo a Transferencia (o de un banco a otro) al momento de pagar.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <Printer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Reimprimir Comanda con Dirección Histórica:</strong>
                      Cada domicilio guarda una &quot;foto&quot; de la dirección con la que se pidió ese día. Al reimprimirlo siempre saldrá con los datos exactos de esa orden.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Anular y Desanular Pedidos:</strong>
                      Al anular debes elegir un motivo (ej. <em>Error de digitación, Cliente canceló</em>). Si te equivocas anulando, filtra por &quot;Anulados&quot; y toca el botón verde para restaurarlo.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Reporte Excel (CSV) en 5 Secciones:</strong>
                      El botón verde <strong>Exportar Excel</strong> genera un archivo que abre directo en Excel con: 1) Resumen de Arqueo, 2) Desglose por Banco, 3) Ranking de Productos, 4) Salidas de Caja y 5) Listado detallado de pedidos.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 3: SALIDAS Y GASTOS
             ========================================== */}
          {seccionActiva === 'salidas' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-2">
                  Guía Completa del Registro de Salidas y Gastos
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Todo dinero que salga durante el turno para compras, proveedores, hielo, bolsas o pago de turnos debe registrarse en el botón rojo <strong>Registrar Salida</strong> dentro de <strong>Pedidos / Histórico</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase">
                      <Banknote className="w-4 h-4 text-rose-400" />
                      <span>Cuándo elegir &quot;Efectivo de Caja&quot;</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Elígelo siempre que <strong>abras la registradora y entregues billetes o monedas físicas</strong>.
                    </p>
                    <p className="text-[11px] text-rose-300/90 font-semibold">
                      ✔ Descuenta automáticamente de &quot;Efvo. en Caja&quot; para que al contar los billetes al final de la noche no te falte plata.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-black text-xs uppercase">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Cuándo elegir &quot;Transferencia / Banco&quot;</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Elígelo cuando pagues un insumo, proveedor o servicio <strong>desde Nequi, Bancolombia o Daviplata</strong> sin tocar los billetes del cajón.
                    </p>
                    <p className="text-[11px] text-purple-300/90 font-semibold">
                      ✔ Queda registrado en los gastos del negocio y en el Excel, pero NO resta de los billetes físicos de la caja.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">1. Categorías de un toque:</strong>
                    Toca <em>Insumos / Mercado</em>, <em>Pago Domiciliario</em>, <em>Bebidas / Hielo</em>, <em>Desechables / Aseo</em>, <em>Nómina / Turno</em> o <em>Servicios / Otros</em>. Si quieres puedes añadir un detalle (ej. <em>&quot;Juan 4 domicilios&quot;</em>) o dejar solo la categoría.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">2. Botones de suma rápida:</strong>
                    Puedes tocar varias veces <code>+$5.000</code>, <code>+$10.000</code>, <code>+$20.000</code> o <code>+$50.000</code> para armar el monto sin usar el teclado, viendo siempre el valor con puntos de mil arriba.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">3. Auditoría de Hora Real:</strong>
                    Cada salida guarda la fecha y la <strong>hora exacta real</strong> en que se registró. Para borrar una salida equivocada, entra a la tarjeta <em>Salidas / Gastos</em> y toca la papelera (pide PIN).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 4: MENÚ, PRECIOS Y CARTA
             ========================================== */}
          {seccionActiva === 'productos' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-3">
                  Gestión Completa del Catálogo de Productos (Módulo con PIN)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Power className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-1">
                        Botón Disponible / Agotado (Desactivar sin borrar):
                      </strong>
                      Si se acabó un producto por hoy (ej. se agotó un ingrediente), toca el botón verde <strong>Disponible</strong> en su tarjeta para pasarlo a <strong>Agotado</strong>. Desaparecerá de inmediato de la Caja POS y podrás volver a activarlo mañana con un clic.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Copy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-1">
                        Botón Duplicar / Clonar Plato:
                      </strong>
                      ¿Vas a crear varios perros o salchipapas que llevan casi los mismos ingredientes? Toca el ícono de <strong>copiar (dos hojas)</strong> en un plato existente: abrirá el formulario con todos sus ingredientes y categoría ya listos para que solo cambies el nombre y el precio.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Calculator className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-1">
                        Precio de Venta vs. Costo Base (Margen de Ganancia):
                      </strong>
                      Si al crear o editar un producto llenas el campo opcional <strong>Costo Base ($)</strong> (lo que te cuesta producir el plato en insumos), el sistema te mostrará el porcentaje de margen (<code>%</code>) y calculará la <strong>Utilidad Estimada</strong> en el Ranking de Productos y en el Excel.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Package className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-1">
                        Categorías e Ingredientes:
                      </strong>
                      Usa el botón <strong>Categorías</strong> arriba a la derecha para crear, renombrar o eliminar secciones del menú. Los ingredientes que escribas dentro de un producto quedarán guardados para poder quitarlos en la Caja POS con un toque.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 5: BACKUPS, SEGURIDAD Y ACTUALIZACIONES
             ========================================== */}
          {seccionActiva === 'seguridad' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                    <CloudUpload className="w-5 h-5" />
                    <span>Cómo Funcionan los Backups (Copias de Seguridad)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El sistema protege tu base de datos de <strong>3 maneras simultáneas</strong>:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Durante el turno (Jueves a Domingo):</strong> Cada vez que cobras un pedido (máximo cada 30 minutos), actualiza silenciosamente la copia del día (<code>1_Jueves</code>, <code>2_Viernes</code>, <code>3_Sabado</code>, <code>4_Domingo</code>).
                    </li>
                    <li>
                      <strong>Al cerrar el programa:</strong> Siempre que cierras Polichinelo POS desde la <strong>X</strong>, espera a terminar el backup antes de apagarse.
                    </li>
                    <li>
                      <strong>Limpieza automática:</strong> Organiza las copias en carpetas por fin de semana (<code>FinDeSemana_...</code>) y conserva las últimas 8 semanas (~2 meses) para no llenar el disco duro.
                    </li>
                  </ul>
                  <p className="text-[11px] text-emerald-300 font-semibold pt-1">
                    💡 Consejo: En el botón &quot;Backups / Drive&quot; del Dashboard, selecciona una carpeta dentro de tu unidad de Google Drive para Escritorio para que suban solas a la nube.
                  </p>
                </div>

                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                    <KeyRound className="w-5 h-5" />
                    <span>Seguridad con PIN de Supervisor y Actualizaciones</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    El <strong>PIN de 4 dígitos</strong> divide lo que puede hacer el cajero de turno vs. el administrador:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Sin PIN (Libre):</strong> Tomar pedidos en Caja POS, usar calculadora de devuelta, imprimir comandas y abrir este Manual de Uso.
                    </li>
                    <li>
                      <strong>Con PIN (Protegido):</strong> Ver el dinero vendido, cuentas de bancos, registrar o eliminar salidas de caja, anular ventas, editar precios/productos y configurar backups.
                    </li>
                    <li>
                      <strong>Botón Actualizaciones:</strong> Descarga mejoras directamente desde internet sin tocar ni borrar tus productos, clientes ni ventas.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 6: SOPORTE TÉCNICO Y SOLUCIÓN DE PROBLEMAS
             ========================================== */}
          {seccionActiva === 'tecnico' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-orange-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-orange-400 font-black text-xs uppercase mb-3">
                  <Wrench className="w-5 h-5" />
                  <span>Soluciones Rápidas a Problemas Técnicos en la Tienda</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* PROBLEMA 1: IMPRESORA */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-100 flex items-center gap-2">
                      <Printer className="w-4 h-4 text-amber-400" />
                      1. La impresora térmica no imprime al tocar &quot;Imprimir Comanda&quot;
                    </h4>
                    <ol className="text-slate-300 space-y-1 list-decimal list-inside">
                      <li>Verifica que la impresora esté encendida (luz azul/verde sin titilar en rojo) y que el cable USB esté bien conectado al PC.</li>
                      <li>En Windows, abre <strong>Configuración -&gt; Bluetooth y dispositivos -&gt; Impresoras y escáneres</strong>.</li>
                      <li>Desactiva la opción <em>&quot;Permitir que Windows administre mi impresora predeterminada&quot;</em>.</li>
                      <li>Entra a tu impresora térmica (POS-80 / Xprinter / Epson) y haz clic en <strong>Establecer como predeterminada</strong>.</li>
                    </ol>
                  </div>

                  {/* PROBLEMA 2: PAPEL EN BLANCO */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      2. La impresora saca el papel pero sale completamente en blanco
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      El rollo de papel térmico se colocó <strong>al revés</strong> (el papel térmico solo tiene químico sensible al calor por una de sus caras). Abre la tapa de la impresora, voltea el rollo para que el papel salga por debajo hacia ti y vuelve a reimprimir desde Histórico.
                    </p>
                  </div>

                  {/* PROBLEMA 3: CARPETA INTERNA APPDATA */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-100 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-sky-400" />
                      3. ¿Dónde están guardados la Base de Datos y el PIN en el PC?
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      Presiona en el teclado <strong>Windows + R</strong>, escribe exactamente:
                    </p>
                    <code className="block bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-amber-300 font-mono text-[11px]">
                      %APPDATA%\polichinelo-pos-app
                    </code>
                    <p className="text-slate-400">
                      • <strong>polichinelo.db:</strong> Es toda la base de datos del negocio.<br />
                      • <strong>seguridad-pin.json:</strong> Si borras este archivo con el programa cerrado, el PIN se reinicia a <strong>1234</strong>.
                    </p>
                  </div>

                  {/* PROBLEMA 4: RESTAURAR BACKUP */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-black text-slate-100 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      4. Cómo restaurar un Backup si se cambia o formatea el computador
                    </h4>
                    <ol className="text-slate-300 space-y-1 list-decimal list-inside">
                      <li>Instala Polichinelo POS en el PC nuevo, ábrelo una vez y ciérralo.</li>
                      <li>Toma tu archivo de backup más reciente de Google Drive (ej. <code>4_Domingo_2026-11-08.db</code>) y cámbiale el nombre a <strong><code>polichinelo.db</code></strong>.</li>
                      <li>Pégalo dentro de <code>%APPDATA%\polichinelo-pos-app</code> reemplazando el existente. ¡Listo!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SECCIÓN 7: PREGUNTAS FRECUENTES (FAQ BUSCABLE)
             ========================================== */}
          {seccionActiva === 'faq' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Mostrando {faqsFiltradas.length} de {LISTA_FAQ_COMPLETA.length} preguntas frecuentes
                </span>
                {busquedaFaq && (
                  <button
                    type="button"
                    onClick={() => setBusquedaFaq('')}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Ver todas las preguntas
                  </button>
                )}
              </div>

              {faqsFiltradas.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs font-bold text-slate-400">
                    No encontramos preguntas que coincidan con &quot;{busquedaFaq}&quot;.
                  </p>
                </div>
              ) : (
                faqsFiltradas.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {faq.categoria}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-amber-400 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{faq.pregunta}</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6">{faq.respuesta}</p>
                    {faq.pasos && (
                      <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside pl-6 pt-1">
                        {faq.pasos.map((paso, i) => (
                          <li key={i}>{paso}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
