# 🍔 Manual de Usuario — Polichinelo POS

Guía rápida y sencilla para manejar la caja, tomar pedidos, imprimir comandas y cuadrar las cuentas del día en **Polichinelo**.

---

## 🧭 1. Pantalla Principal (Dashboard)

Al abrir el programa verás el **Centro de Control** con 3 tarjetas principales y 3 botones arriba a la derecha:

| Opción | ¿Para qué sirve? | ¿Pide PIN? |
| :--- | :--- | :---: |
| **Nuevo Pedido (POS)** | Pantalla principal para atender clientes, armar pedidos y cobrar. | ❌ Libre |
| **Histórico de Ventas** | Ver ventas del día, dinero en efectivo, pagos por bancos, registrar salidas y exportar a Excel. | 🔒 Sí (PIN) |
| **Catálogo de Productos** | Crear productos nuevos, cambiar precios, agregar fotos o desactivar platos. | 🔒 Sí (PIN) |

**Botones superiores:**
* 🔄 **Actualizaciones:** Busca si hay una versión nueva del programa y la instala con un clic.
* ☁️ **Backups / Drive:** Guarda una copia de seguridad de todas las ventas y productos (requiere PIN).
* 🔑 **Cambiar PIN:** Permite cambiar la clave de 4 dígitos del supervisor.

---

## 🛒 2. Cómo Tomar un Pedido (Caja POS)

### Paso 1: Elegir el Tipo de Pedido (Arriba a la izquierda)
Antes de cobrar, selecciona cómo se entregará el pedido:

1. 🍽️ **Para Acá (Mesa):**
   * Escribe el **Nombre del Cliente** (obligatorio para llamarlo cuando esté listo).
   * Opcional: escribe una *Nota general del pedido* (ej. *"Entregar todo junto"*).
2. 🛍️ **Para Llevar:**
   * Escribe el **Nombre del Cliente** (obligatorio).
   * Opcional: *Nota general del pedido* (ej. *"Salsas aparte"*).
3. 🛵 **Domicilio:**
   * Escribe primero el **Teléfono / Celular** y presiona la lupa 🔍 (o Enter).
   * **Si el cliente ya ha pedido antes**, su nombre, dirección y referencia se llenarán solos.
   * **Si es cliente nuevo**, escribe su **Nombre**, **Dirección de entrega** y **Referencia** (ej. *"Casa rejas blancas, 2do piso"*). Al cobrar, el sistema lo guardará automáticamente para la próxima vez.
   * En el panel derecho podrás escribir el **Valor del Domicilio ($)** (ej. `3000` o `4000`).

---

### Paso 2: Agregar Productos al Carrito
* **Agregar rápido (+1):** Toca cualquier producto de la pantalla y se sumará de inmediato a la comanda de la derecha.
* **Personalizar (Sin cebolla, adiciones, notas):**
  * Toca el ícono de **lápiz / nota** en la tarjeta del producto (o toca el producto dentro de la lista de la derecha).
  * Ahí podrás desmarcar ingredientes (ej. *Sin ripio, Sin salsas*), sumar adiciones o escribir una observación y subirle el precio si lleva algún adicional.
* **Ítem Libre (Botón `+` en la cabecera de la Comanda):**
  * Si necesitas cobrar algo que no está en el menú, toca el botón **`+`** arriba a la derecha en la comanda, escribe el nombre y el precio.
* **⭐ Plato del Día:**
  * Con el botón **Plato del Día** puedes marcar qué productos son especiales hoy o crear un especial rápido.

---

### Paso 3: Elegir Método de Pago y Cobrar (Panel Derecho)
1. Selecciona cómo paga el cliente:
   * 💵 **Efectivo:**
     * Puedes escribir con cuánto billete te pagan en **"Pagan con"** (o tocar los botones rápidos de `$10.000`, `$20.000`, `$50.000`, `$100.000`).
     * El sistema te mostrará en grande la **Devuelta (Cambio)** exacta y también la imprimirá en el recibo.
   * 📱 **Transferencia:**
     * Selecciona a qué banco entró el dinero (**Nequi**, **Bancolombia**, **Daviplata**, etc.).
2. Toca el botón grande **COBRAR PEDIDO**.

---

### Paso 4: Imprimir la Comanda / Recibo
Al cobrar, se abrirá la vista previa del ticket:
* 🖨️ **Imprimir Comanda (Térmica):** Imprime directamente en la impresora de recibos de 80mm sin preguntar nada.
* 📄 **Guardar PDF:** Por si necesitas guardar el recibo en archivo digital para enviarlo por WhatsApp.

> [!TIP]
> **¿Se acabó el papel o salió mal impreso?**
> Puedes volver a imprimir cualquier recibo entrando a **Histórico de Ventas** y tocando el ícono de impresora 🖨️ al lado del pedido.

---

## 📊 3. Histórico de Ventas, Arqueo y Salidas (Requiere PIN)

Al entrar a **Pedidos / Histórico** verás el resumen completo del negocio:

### Tarjetas Superiores (El Cuadre de Caja)
1. **Total Facturado:** Todo lo vendido en el día (Efectivo + Bancos), sin contar pedidos anulados.
2. **Efvo. Ventas:** Todo lo que pagaron en efectivo por ventas.
3. **Bancos / Transf.:** Todo lo que entró por Nequi, Bancolombia, etc. *(Si tocas esta tarjeta, verás cuánto entró exactamente a cada banco).*
4. **Salidas / Gastos:** Todo el dinero que se sacó para pagos o compras. *(Si tocas esta tarjeta, verás la lista de todas las salidas con fecha y hora).*
5. **Efvo. en Caja (El billete real en gaveta):**
   $$\text{Efectivo en Caja} = \text{Efvo. Ventas} - \text{Salidas en Efectivo}$$
6. **Domicilios:** Muestra cuántos domicilios salieron y cuánto dinero suman los envíos para liquidar a los domiciliarios.
7. **Productos Más Vendidos:** Toca esta tarjeta para ver el ranking de los platos más vendidos y su ganancia estimada.

---

### 💸 Cómo Registrar una Salida o Gasto
Cuando saques dinero para pagar insumos, hielo, domiciliarios o turnos:
1. En **Histórico de Ventas**, toca el botón rojo **Registrar Salida** (arriba a la derecha).
2. Elige **¿De dónde sale el dinero?**:
   * **Efectivo de Caja:** Si sacaste billetes físicos de la registradora (se descontará de *Efvo. en Caja*).
   * **Transferencia / Banco:** Si pagaste desde Nequi/Bancolombia (queda registrado en gastos pero **no** descuadra los billetes de la caja).
3. Toca una **Categoría rápida** (*Insumos / Mercado*, *Pago Domiciliario*, *Bebidas / Hielo*, etc.) y si quieres escribe un detalle (ej. nombre del domiciliario).
4. Escribe el monto o usa los botones rápidos (`+$5.000`, `+$10.000`, `+$20.000`, `+$50.000`) y dale a **Guardar Salida**.

---

### 🔄 Acciones sobre un Pedido ya Cobrado
En la lista de ventas del día puedes:
* **Ver qué pidió:** Toca la fila del pedido para desplegar los productos y la dirección.
* **Cambiar Método de Pago (Ícono de billetera/tarjeta):** Si el cliente iba a pagar en Efectivo y al final pagó por Nequi (o viceversa), cámbialo ahí sin tener que anular el pedido.
* **Reimprimir Ticket (Ícono de impresora 🖨️):** Vuelve a sacar el recibo.
* **Anular Pedido (Ícono de papelera 🗑️):** Pide el motivo de anulación. El pedido queda en rojo como `ANULADO` y su dinero se descuenta automáticamente de las cuentas del día.
* **Exportar Excel / CSV (Botón verde arriba a la derecha):** Descarga un archivo listo para abrir en Excel con el cuadre de caja, bancos, ranking de productos, gastos y todas las ventas.

---

## 📦 4. Catálogo de Productos (Requiere PIN)

En el módulo **Productos** puedes:
* **Crear Producto:** Asignarle nombre, categoría, precio de venta, costo base (opcional, para calcular ganancias), foto e ingredientes base.
* **Editar Precio o Nombre:** Toca el botón de editar en cualquier producto.
* **Activar / Desactivar (Switch):** Si un producto se agotó por completo o ya no se vende, apágalo con el switch para que no aparezca en la pantalla de pedidos.
* **Categorías e Ingredientes:** Desde los botones superiores puedes crear nuevas categorías (ej. *Perros, Salchipapas, Bebidas*) o nuevos ingredientes para personalizar.

---

## ☁️ 5. Copias de Seguridad (Backups)

* **Automático al cerrar:** Cada vez que cierras el programa desde la `X`, el sistema guarda automáticamente una copia de seguridad de la base de datos antes de apagarse.
* **Google Drive:** Si la carpeta de backups está apuntando a tu unidad de **Google Drive para Escritorio**, tus copias se subirán solas a la nube cuando haya internet.
