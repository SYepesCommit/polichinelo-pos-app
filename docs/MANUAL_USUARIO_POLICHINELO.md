# 🍔 Manual Completo de Usuario y Operación — Polichinelo POS

Guía oficial paso a paso para cajeros, encargados de turno y administradores de **Polichinelo**.
*(Este mismo manual también está integrado dentro del programa tocando el botón **Manual de Uso** en el Dashboard o el ícono 📖 abajo a la izquierda).*

---

## 🧭 1. Pantalla Principal (Dashboard) y Permisos

Al abrir **Polichinelo POS** verás el **Centro de Control** con 3 módulos principales y 4 botones de gestión en la parte superior derecha:

| Módulo / Botón | ¿Para qué sirve? | ¿Pide PIN? |
| :--- | :--- | :---: |
| **Nuevo Pedido (POS)** | Pantalla principal para tomar pedidos, calcular devueltas e imprimir comandas. | ❌ Libre |
| **Manual de Uso** | Abre la guía interactiva con buscador de dudas desde cualquier pantalla. | ❌ Libre |
| **Actualizaciones** | Revisa en internet si hay una versión nueva del sistema y la instala con 1 clic. | ❌ Libre |
| **Histórico de Ventas** | Cuadre de caja, desglose de bancos, salidas de dinero, ranking de platos y Excel. | 🔒 Sí (PIN) |
| **Catálogo de Productos** | Crear o clonar productos, cambiar precios, marcar agotados y crear categorías. | 🔒 Sí (PIN) |
| **Backups / Drive** | Ver y ejecutar copias de seguridad locales o sincronizadas con Google Drive. | 🔒 Sí (PIN) |
| **Cambiar PIN** | Cambiar la clave de 4 dígitos del supervisor. | 🔒 Sí (PIN actual) |

---

## 🛒 2. Cómo Tomar un Pedido Paso a Paso (Caja POS)

### Paso 1: Elegir la Modalidad del Pedido (Arriba a la izquierda)
Antes de cobrar, selecciona cómo se entregará la orden:

1. 🍽️ **Para Acá (Mesa):**
   * **Nombre del Cliente (Obligatorio):** Escribe siempre el nombre del cliente para llamarlo cuando su pedido salga de cocina (no se usan números de mesa).
   * **Notas del pedido (Opcional):** Instrucciones generales para toda la orden (ej. *"Entregar todo junto"*, *"Con cubiertos"*).
2. 🛍️ **Para Llevar:**
   * **Nombre del Cliente (Obligatorio):** Para marcar la bolsa/empaque.
   * En la impresora térmica saldrá encabezado con `*** PARA LLEVAR ***`.
3. 🛵 **Domicilio:**
   * **Primero escribe el Teléfono / Celular** y toca el botón de la **lupa 🔍** (o presiona `Enter`).
   * **Si el cliente ya existe:** Aparecerá la etiqueta verde **`Registrado`** y se llenarán solos su **Nombre**, **Dirección** y **Referencia**.
     > 💡 *¿El cliente se mudó?* Simplemente borra la dirección anterior y escribe la nueva ahí mismo. Al cobrar el pedido, el sistema actualizará su ficha automáticamente para el futuro.
   * **Si es cliente nuevo:** Llena su Nombre, Dirección y Referencia (ej. *"2do piso, rejas blancas"*). Al cobrar, quedará guardado en la base de datos automáticamente.
   * **Valor del Domicilio ($):** En el panel derecho podrás escribir el costo del envío (ej. `3000`, `4000`, `5000`).

---

### Paso 2: Agregar Productos, Personalizar e Ítem Libre
* **Agregar rápido (`+ Agregar`):** Suma 1 unidad estándar del plato a la comanda. Si vuelves a tocarlo, sube la cantidad (`1x -> 2x -> 3x`).
* **Personalizar (`Personalizar` o tocar el ítem en la comanda):**
  * **Quitar ingredientes:** Toca los ingredientes que el cliente **NO** quiere (quedarán marcados como `SIN Cebolla`, `SIN Salsas`, etc.).
  * **Agregar adiciones / notas:** Selecciona adiciones o escribe cualquier indicación especial para cocina.
  * **Subir el Precio Unitario:** Si el cliente pidió una adición con costo extra, puedes modificar el **Precio Unitario ($)** directamente en esa ventana antes de guardar.
* **Ítem Libre (Botón `+` en la cabecera de la Comanda):**
  * Si necesitas cobrar algo que no está en la carta (un combo especial, una bebida ocasional, un recargo), toca el botón **`+`** arriba a la derecha al lado de "Comanda", escribe el nombre, cantidad y precio.
* **⭐ Plato del Día:**
  * Toca **Plato del Día** en la barra de categorías para marcar qué productos tienen estrella de especial hoy o para crear un plato especial rápido.

---

### Paso 3: Método de Pago, Calculadora de Devuelta e Impresión
1. **Si pagan en Efectivo:**
   * Escribe con cuánto billete paga el cliente en **"Pagan con"** o toca los botones rápidos (`$10k`, `$20k`, `$50k`, `$100k`, `Exacto`).
   * El sistema mostrará en grande la **Devuelta (Cambio)** y **también la imprimirá en el recibo** (muy útil en domicilios para mandar el cambio exacto con el domiciliario).
2. **Si pagan por Transferencia:**
   * Selecciona obligatoriamente a qué banco o billetera entró el pago (**Nequi**, **Bancolombia**, **Daviplata**, **Bre-B**).
   * Si el negocio abre una cuenta nueva, puedes agregarla tocando **`+ Nuevo`** al lado de Bancos.
3. **Cobrar e Imprimir:**
   * Toca **COBRAR PEDIDO**. Se abrirá la vista previa del recibo.
   * Toca **Imprimir Comanda** para que salga inmediatamente en la impresora térmica de 80mm, o **Guardar PDF** si quieres conservarlo en digital sin gastar papel.

---

## 📊 3. Cuadre de Caja, Turno de Madrugada e Histórico (Con PIN)

### 🧮 La Fórmula Exacta del Cuadre de Caja
En la parte superior de **Pedidos / Histórico** verás las tarjetas financieras del período seleccionado:

$$\text{Efectivo Esperado en Caja} = \text{Efvo. Ventas} - \text{Salidas de Efectivo}$$

* **Total Facturado:** Suma de todas las ventas realizadas (Efectivo + Transferencias). *Los pedidos anulados no suman.*
* **Efvo. Ventas:** Todo el dinero que entró en billetes/monedas por ventas.
* **Bancos / Transf. (Tarjeta Interactiva 👁️):** Suma de todo lo pagado por transferencia. **Tócala** para ver cuánto entró exactamente a **Nequi**, cuánto a **Bancolombia**, etc., y toca cualquier banco para filtrar los pedidos de ese banco.
* **Salidas / Gastos (Tarjeta Interactiva 👁️):** Muestra el total de gastos y separa cuánto salió de **Caja (Efectivo)** y cuánto por **Transferencia**. **Tócala** para ver la lista detallada con fecha y hora.
* **Efvo. en Caja:** Es el dinero físico neto que debe haber en la registradora por las operaciones del día *(sin contar la base inicial con la que hayas empezado el turno)*.
* **Domicilios:** Muestra cuántos domicilios se despacharon y cuánto dinero suman únicamente los envíos (`$XX.XXX en envíos`) para liquidar a los domiciliarios.
* **Productos Más Vendidos (Tarjeta Interactiva 🏆):** **Tócala** para abrir el ranking de todos los productos vendidos con unidades, total generado y utilidad estimada.

---

### 🌙 Cómo Funciona el "Turno de Madrugada" (Corte a las 04:00 a. m.)
En un restaurante nocturno es común cerrar después de las 12:00 de la medianoche:
* Polichinelo POS mantiene la misma jornada operativa hasta las **03:59 a. m.**
* Si un sábado por la noche cobras los últimos pedidos o registras el pago del domiciliario a las **12:30 a. m.** (madrugada del domingo), el sistema los incluye dentro del arqueo del **Sábado** y realiza el backup automático del **Domingo/Sábado** sin saltar de día por accidente.

---

### 🔄 Acciones Rápidas sobre Pedidos ya Cobrados
En la tabla de ventas puedes:
1. **Ver detalle del pedido:** Toca cualquier fila para desplegar los productos, notas, teléfono y dirección de entrega.
2. **Cambiar Método de Pago (Ícono de billetera/tarjeta):** Si cobraste en Efectivo pero el cliente pagó por Nequi (o viceversa), cámbialo con 1 clic sin anular el pedido.
3. **Reimprimir Recibo (Ícono de impresora 🖨️):** Vuelve a imprimir la comanda en la térmica o guárdala en PDF.
4. **Anular o Restaurar Pedido (Ícono de papelera 🗑️ / flecha verde):**
   * Al anular debes indicar el motivo (*Error de digitación*, *Cliente canceló*, etc.). El dinero se descuenta de inmediato de todas las tarjetas.
   * Si anulaste por error, filtra por estado **Anulados** y toca el botón verde para restaurar la venta.
5. **Exportar Reporte a Excel (Botón verde arriba a la derecha):**
   * Genera un archivo `.csv` optimizado para Excel en español con **5 tablas**: 1) Resumen de Arqueo, 2) Desglose por Banco, 3) Ranking de Productos y Utilidad, 4) Salidas y Gastos, y 5) Listado detallado de ventas.

---

## 💸 4. Registro de Salidas y Gastos

Para registrar cualquier salida de dinero, entra a **Pedidos / Histórico** y toca el botón rojo **Registrar Salida**:

1. **¿De dónde sale el dinero? (Muy importante para no descuadrar caja):**
   * 💵 **Efectivo de Caja:** Elígelo cuando saques **billetes físicos de la registradora** (ej. pagar hielo, bolsas, pago a domiciliario o turno en efectivo). **Sí resta** de *Efvo. en Caja*.
   * 📱 **Transferencia / Banco:** Elígelo cuando pagues a un proveedor o gasto desde **Nequi / Bancolombia**. Queda registrado en el total de gastos y en el Excel, pero **NO resta** de los billetes físicos de la registradora.
2. **Categoría rápida (1 toque):**
   * Toca *Insumos / Mercado*, *Pago Domiciliario*, *Bebidas / Hielo*, *Desechables / Aseo*, *Nómina / Turno* o *Servicios / Otros*. Puedes dejar solo la categoría o escribir un detalle adicional (ej. *"Juan 5 envíos"*).
3. **Monto con botones rápidos:**
   * Escribe el valor o toca varias veces `+$5.000`, `+$10.000`, `+$20.000`, `+$50.000` verificando el número con puntos de mil arriba.

---

## 📦 5. Catálogo de Productos, Categorías e Ingredientes (Con PIN)

* **Disponible / Agotado (Botón de encendido en cada tarjeta):** Si se acaba un producto durante la noche, cámbialo a **Agotado**. Desaparecerá de la Caja POS al instante y podrás volver a encenderlo cuando haya stock.
* **Duplicar / Clonar Producto (Ícono de dos hojas):** Crea un producto nuevo copiando todos los ingredientes y categoría de otro plato parecido para ahorrar tiempo.
* **Costo Base y Margen (`%`):** Si ingresas cuánto cuesta preparar el plato en **Costo Base ($)**, verás el porcentaje de rentabilidad en la tarjeta y la ganancia neta estimada en los reportes.

---

## 🔧 6. Solución Rápida de Problemas en la Tienda

| Problema | Causa más común | Solución paso a paso |
| :--- | :--- | :--- |
| **No imprime nada al darle a "Imprimir Comanda"** | La impresora está apagada, desconectada o Windows cambió la impresora predeterminada. | 1. Revisa cable USB y luz de encendido.<br>2. En Windows ve a *Impresoras y escáneres*.<br>3. Desmarca *"Permitir que Windows administre mi impresora predeterminada"*.<br>4. Marca la impresora térmica como **Predeterminada**. |
| **La impresora saca el papel completamente en blanco** | El rollo de papel térmico se metió al revés. | Abre la tapa de la impresora y dale la vuelta al rollo (el lado liso sensible al calor debe quedar hacia el cabezal térmico). |
| **Olvidaron el PIN de supervisor** | Se cambió el PIN y nadie lo recuerda. | 1. Cierra Polichinelo POS.<br>2. Presiona `Windows + R`, escribe `%APPDATA%\polichinelo-pos-app` y da Enter.<br>3. Borra el archivo `seguridad-pin.json`.<br>4. Abre el programa: el PIN volverá a ser **`1234`**. |
| **Quiero probar el programa sin gastar papel** | Pruebas de caja o capacitación. | Al cobrar, en la vista previa del ticket toca **Cerrar** o **Guardar PDF** en lugar de *Imprimir Comanda*. |

---

## ❓ 7. Preguntas Frecuentes (FAQ)

1. **¿Qué hago si cobré en Efectivo y el cliente terminó pagando por Nequi?**
   Entra a *Pedidos / Histórico*, busca el pedido y toca el ícono de billetera/tarjeta (*Cambiar método de pago*). Cámbialo a Transferencia -> Nequi y el arqueo se ajustará solo.
2. **¿Cómo le pago los envíos al domiciliario al final de la noche?**
   Mira la tarjeta **Domicilios** en Histórico: ahí dice exactamente cuánto dinero suman los envíos (ej. `$32.000 en envíos`). Si le entregas ese dinero en efectivo de la caja, regístralo en **Registrar Salida -> Efectivo de Caja -> Pago Domiciliario** para que se descuente de los billetes esperados.
3. **¿Por qué al buscar un cliente o filtrar por un banco abajo en Histórico no cambian las tarjetas de arriba?**
   Para proteger tu cuadre de caja: las tarjetas de arriba muestran siempre el cierre global de la jornada o rango de fechas seleccionado, mientras que los filtros de abajo te permiten buscar pedidos específicos sin perder de vista el total del día.
4. **¿Cada cuánto se hacen las copias de seguridad (Backups)?**
   Automáticamente cada 30 minutos mientras vendes (de jueves a domingo) y **siempre** cada vez que cierras el programa desde la `X`.
