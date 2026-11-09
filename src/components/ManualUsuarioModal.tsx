import React, { useState } from 'react'
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
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

interface ManualUsuarioModalProps {
  onCerrar: () => void
}

type SeccionManual = 'pos' | 'caja' | 'salidas' | 'productos' | 'faq'

export const ManualUsuarioModal: React.FC<ManualUsuarioModalProps> = ({ onCerrar }) => {
  const [seccionActiva, setSeccionActiva] = useState<SeccionManual>('pos')

  const secciones: { id: SeccionManual; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'pos', label: '1. Hacer Pedidos', icon: ShoppingCart, color: 'text-amber-400' },
    { id: 'caja', label: '2. Cuadre e Histórico', icon: Receipt, color: 'text-sky-400' },
    { id: 'salidas', label: '3. Salidas / Gastos', icon: TrendingDown, color: 'text-rose-400' },
    { id: 'productos', label: '4. Menú y Precios', icon: Package, color: 'text-emerald-400' },
    { id: 'faq', label: '5. Dudas Frecuentes', icon: HelpCircle, color: 'text-purple-400' },
  ]

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[86vh] shadow-2xl flex flex-col overflow-hidden">
        {/* CABECERA */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                Manual de Uso · Polichinelo POS
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Guía práctica paso a paso para cajeros y supervisores
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold uppercase tracking-wider transition active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Guía</span>
          </button>
        </div>

        {/* BARRA DE PESTAÑAS / SECCIONES */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap gap-2 shrink-0">
          {secciones.map((sec) => {
            const Icon = sec.icon
            const activa = seccionActiva === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSeccionActiva(sec.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition active:scale-95 ${
                  activa
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${activa ? 'text-slate-950' : sec.color}`} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* CONTENIDO DE LA SECCIÓN ACTIVA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {seccionActiva === 'pos' && (
            <div className="space-y-5">
              {/* PASO 1: TIPO DE PEDIDO */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 1 · Arriba a la izquierda
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Elegir el Tipo de Pedido y Datos del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase mb-1.5">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Para Acá (Mesa)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Escribe el <strong>Nombre del Cliente</strong> (obligatorio) para poder llamarlo cuando salga su pedido. Si necesitas aclarar algo general, escríbelo en <em>Notas del pedido</em>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-sky-500/30">
                    <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase mb-1.5">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Para Llevar</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Escribe el <strong>Nombre del Cliente</strong> (obligatorio) y opcionalmente una nota (ej. <em>&quot;Empacar salsas aparte&quot;</em>).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase mb-1.5">
                      <Bike className="w-4 h-4" />
                      <span>Domicilio</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Digita primero el <strong>Teléfono</strong> y toca la lupa 🔍. Si ya existe, se llenan solos su nombre y dirección. Si es nuevo, llénalos y se guardarán solos al cobrar.
                    </p>
                  </div>
                </div>
              </div>

              {/* PASO 2: AGREGAR PRODUCTOS Y PERSONALIZAR */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 2 · Centro de la pantalla
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Armar el Pedido, Quitar Ingredientes y Adiciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Toque rápido en la foto/tarjeta:</strong>
                      Agrega 1 unidad del producto inmediatamente a la comanda de la derecha.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Sin cebolla / Con adición (Personalizar):</strong>
                      Toca el producto ya agregado en la lista de la derecha (o el botón de personalizar). Ahí puedes quitar ingredientes base, marcar adiciones o ajustar el precio unitario si lleva algo extra.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Plus className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Cobrar algo fuera de carta (Ítem Libre):</strong>
                      En la parte superior derecha (al lado de &quot;Comanda&quot;), toca el botón <strong>+</strong> para escribir cualquier concepto y precio libremente.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3">
                    <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Plato del Día:</strong>
                      Usa el botón <strong>Plato del Día</strong> para destacar productos especiales de hoy o crear un plato rápido del día.
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 3: PAGO, DEVUELTA E IMPRESIÓN */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                  Paso 3 · Panel derecho (Comanda)
                </span>
                <h3 className="text-base font-black text-slate-100 mt-2 mb-3">
                  Cobrar, Calcular Devuelta e Imprimir Recibo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase mb-1">
                      <Banknote className="w-4 h-4" />
                      <span>Pago en Efectivo</span>
                    </div>
                    Escribe con cuánto te pagan en <strong>&quot;Pagan con&quot;</strong> (o toca <code>$10k</code>, <code>$20k</code>, <code>$50k</code>, <code>$100k</code>). El sistema calcula la <strong>Devuelta</strong> y también la imprime en el recibo.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-purple-400 font-black uppercase mb-1">
                      <Smartphone className="w-4 h-4" />
                      <span>Pago por Transferencia</span>
                    </div>
                    Al elegir Transferencia, selecciona siempre el banco receptor (<strong>Nequi, Bancolombia, Daviplata</strong>) para que el cuadre por banco sea exacto.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase mb-1">
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Comanda</span>
                    </div>
                    Al tocar <strong>COBRAR PEDIDO</strong> se abre el recibo. Toca <strong>Imprimir Comanda</strong> para que salga directo por la impresora térmica de 80mm.
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'caja' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Módulo Protegido con PIN de Supervisor</span>
                </div>
                <h3 className="text-base font-black text-slate-100 mb-3">
                  ¿Qué significa cada tarjeta del Cuadre de Caja?
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-black text-amber-400 uppercase block mb-1">
                      1. Total Facturado
                    </span>
                    <p className="text-slate-300">
                      Es la suma de todas las ventas activas del período (Efectivo + Transferencias). Los pedidos anulados no suman aquí.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-black text-emerald-400 uppercase block mb-1">
                      2. Efvo. Ventas vs. Efvo. en Caja
                    </span>
                    <p className="text-slate-300">
                      <strong>Efvo. Ventas</strong> es todo lo que pagaron en billetes. <strong>Efvo. en Caja</strong> es lo que debe haber físicamente en la gaveta después de restar las salidas en efectivo.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-black text-purple-300 uppercase block mb-1">
                      3. Bancos / Transf. (Interactiva)
                    </span>
                    <p className="text-slate-300">
                      Toca esta tarjeta para ver cuánto dinero entró exactamente a <strong>Nequi</strong>, cuánto a <strong>Bancolombia</strong>, etc., y filtrar los pedidos de ese banco.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-black text-emerald-400 uppercase block mb-1">
                      4. Domicilios y Envíos
                    </span>
                    <p className="text-slate-300">
                      Muestra cuántos domicilios se despacharon y cuánto suman en total los recargos de envío para liquidar a los domiciliarios fácilmente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-3">
                  Acciones rápidas sobre pedidos ya cobrados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Cambiar Método de Pago:</strong>
                      Si el pedido se cobró como Efectivo pero el cliente terminó pagando por Nequi, toca el botón de cambiar pago en la fila de la venta. ¡No hace falta anularlo!
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <Printer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Reimprimir Comanda / Recibo:</strong>
                      Toca el ícono de impresora en cualquier pedido para volver a imprimirlo en la térmica o guardarlo en PDF.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Anular o Restaurar Pedido:</strong>
                      Si un pedido se canceló, anúlalo indicando el motivo. Su valor se descontará del total. Si lo anulaste por error, puedes restaurarlo con el botón verde.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-100 block mb-0.5">Exportar Reporte a Excel (CSV):</strong>
                      Descarga un archivo completo para Excel con resumen de caja, desglose por banco, ranking de productos vendidos, salidas y detalle de cada venta.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'salidas' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-2">
                  Cómo Registrar Salidas de Dinero o Gastos
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Dentro de <strong>Pedidos / Histórico</strong>, toca el botón rojo <strong>Registrar Salida</strong> arriba a la derecha.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                    <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase mb-1.5">
                      <Banknote className="w-4 h-4 text-rose-400" />
                      <span>Opción 1: Efectivo de Caja</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Úsalo cuando <strong>sacas billetes físicos de la caja registradora</strong> (ej. pagar hielo, bolsas o turno en efectivo). Este valor <strong>sí se resta</strong> de la tarjeta <em>Efvo. en Caja</em>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                    <div className="flex items-center gap-2 text-purple-300 font-black text-xs uppercase mb-1.5">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Opción 2: Transferencia / Banco</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Úsalo cuando pagas un gasto desde <strong>Nequi o Bancolombia</strong>. Queda sumado en el total de gastos del día, pero <strong>NO descuadra los billetes físicos</strong> de la gaveta.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p>
                    <strong className="text-amber-400">• Categorías rápidas:</strong> Puedes tocar <em>Insumos / Mercado</em>, <em>Pago Domiciliario</em>, <em>Bebidas / Hielo</em>, etc. sin necesidad de escribir todo a mano.
                  </p>
                  <p>
                    <strong className="text-amber-400">• Botones de monto rápido:</strong> Usa <code>+$5.000</code>, <code>+$10.000</code>, <code>+$20.000</code> o <code>+$50.000</code> para sumar rápido sin equivocarte con los ceros.
                  </p>
                  <p>
                    <strong className="text-amber-400">• Ver o borrar salidas:</strong> Tocando la tarjeta roja <strong>Salidas / Gastos</strong> verás todas las salidas con su fecha, hora exacta y si fueron en efectivo o transferencia.
                  </p>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'productos' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-black text-slate-100 mb-3">
                  Administración del Menú, Categorías e Ingredientes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400 uppercase block mb-1">
                      Crear o Editar un Producto
                    </strong>
                    Puedes definir su nombre, categoría, precio de venta, costo base (para calcular utilidad en los reportes), imagen e ingredientes predeterminados.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 uppercase block mb-1">
                      Activar / Desactivar Productos (Switch)
                    </strong>
                    Si un producto se agotó hoy, simplemente apaga su interruptor en la columna de estado. Desaparecerá de la pantalla de pedidos sin perder su historial.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-sky-400 uppercase block mb-1">
                      Categorías del Menú
                    </strong>
                    En el botón <strong>Categorías</strong> puedes crear o renombrar secciones del menú (todas las categorías se acomodan automáticamente en filas visibles).
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-purple-400 uppercase block mb-1">
                      Ingredientes Base
                    </strong>
                    En el botón <strong>Ingredientes</strong> creas los componentes (ej. <em>Queso, Tocineta, Salsas, Cebolla</em>) para asignarlos a los platos y poder quitarlos en caja con un toque.
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'faq' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  ¿Qué hago si un cliente de domicilio se mudó o cambió de dirección?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Al buscar su teléfono en Domicilio, simplemente borra la dirección anterior y escribe la nueva. Al cobrar el pedido, el sistema actualizará la ficha del cliente automáticamente y dejará guardada la dirección exacta en ese recibo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  ¿Qué pasa si cierro el programa al terminar la noche?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada vez que cierras Polichinelo POS desde la <strong>X</strong>, el sistema genera automáticamente una copia de seguridad de toda la base de datos en tu carpeta configurada (y en Google Drive si está sincronizada).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  ¿Cómo sé si hay una actualización nueva del sistema?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En la pantalla principal (Dashboard), toca el botón <strong>Actualizaciones</strong>. Si hay una versión nueva, se descargará sola y el botón se pondrá verde diciendo <strong>Instalar</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
