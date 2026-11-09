# 🛠️ Manual Técnico y de Mantenimiento — Polichinelo POS

Este documento está diseñado para ti como dueño y administrador técnico del proyecto. Aquí tienes **todo lo necesario para modificar el código, solucionar problemas y publicar nuevas versiones (Releases)** por tu cuenta desde la terminal, sin depender de Gemini ni de ningún asistente de IA.

---

## 1. Requisitos del Computador donde Programas

Si algún día cambias de computador y necesitas abrir el código fuente:
1. **Node.js** (versión 20 LTS o superior): [https://nodejs.org](https://nodejs.org)
2. **pnpm** (gestor de paquetes): Se instala abriendo PowerShell y corriendo:
   ```powershell
   npm install -g pnpm
   ```
3. **Git**: [https://git-scm.com](https://git-scm.com)
4. **Visual Studio Code**: Para editar los archivos.

Para descargar e instalar las dependencias del proyecto por primera vez:
```powershell
git clone https://github.com/SYepesCommit/polichinelo-pos-app.git
cd polichinelo-pos-app
pnpm install
```

---

## 2. Mapa del Proyecto (¿Dónde está cada cosa?)

El proyecto se divide en **2 partes**:
* **`src/` (Frontend - React + Tailwind):** Todo lo visual (pantallas, botones, modales).
* **`electron/` (Backend local - Electron + Prisma SQLite):** Base de datos, impresora térmica, backups y auto-actualizaciones.

### Archivos Clave que más podrías tocar:

| Qué quieres cambiar | Archivo exacto |
| :--- | :--- |
| **Versión del programa** | `package.json` (línea `"version": "1.0.3"`) |
| **Diseño del recibo en Impresora Térmica (80mm)** | `electron/modules/printer/printer.service.ts` |
| **Diseño del recibo en vista previa PDF** | `src/services/ticketPdf.service.ts` |
| **Pantalla principal (Dashboard)** | `src/modules/dashboard/DashboardView.tsx` |
| **Pantalla de tomar pedidos (Caja POS)** | `src/modules/pos/PosView.tsx`, `PedidoHeader.tsx`, `ComandaPanel.tsx` |
| **Pantalla de Histórico, Arqueo y Salidas** | `src/modules/ventas/VentasHistorialView.tsx`, `VentasMetrics.tsx`, `GastosCajaModals.tsx` |
| **Lógica de guardar pedidos en BD** | `electron/modules/pedido/pedido.service.ts` |
| **Lógica de ventas, métricas y Excel CSV** | `electron/modules/venta/venta.service.ts` |
| **Lógica de Salidas / Gastos** | `electron/modules/gasto/gasto.service.ts` |
| **Lógica de Backups automáticos** | `electron/modules/backup/backup.service.ts` |
| **Configuración de Base de Datos SQLite** | `electron/config/database.ts` y `prisma/schema.prisma` |
| **Arranque y cierre de la aplicación** | `electron/main.ts` |

---

## 3. Comandos de Uso Diario en Terminal

Abre la terminal en la carpeta del proyecto (`c:\Users\yepes\Desktop\polichinelo-pos-app\polichinelo-pos-app`):

### A. Probar el programa en modo desarrollo (en vivo)
```powershell
pnpm run dev
```
> Abre la ventana de Polichinelo POS en modo desarrollo. Cada vez que guardes un archivo en `src/`, la pantalla se actualiza sola al instante.

### B. Revisar que no haya errores de código (TypeScript)
Antes de empaquetar, corre siempre este comando para verificar que no haya ningún error de sintaxis:
```powershell
npx tsc --noEmit
```
> Si no muestra ningún error (`error TS...`), el código está perfecto.

---

## 4. Paso a Paso para Crear y Publicar una Nueva Release (Actualización)

Cada vez que hagas mejoras y quieras que el computador de la tienda se actualice con el botón **"Actualizaciones"**, sigue exactamente estos **5 pasos**:

### Paso 1: Subir el número de versión en `package.json`
Abre el archivo `package.json` y sube el número en `"version"`.
* Ejemplo: Si estaba en `"1.0.3"`, cámbialo a `"1.0.4"`.
> [!IMPORTANT]
> Nunca repitas un número de versión que ya hayas subido antes. Siempre debe ser mayor (`1.0.4`, `1.0.5`, `1.1.0`, etc.).

### Paso 2: Cerrar Polichinelo POS si está abierto y Empaquetar
En la terminal, ejecuta:
```powershell
pnpm run build
```
Esto creará una carpeta nueva llamada **`release/1.0.4/`** (con el número que pusiste).

### Paso 3: Guardar los cambios en Git y subir el Tag a GitHub
Ejecuta estos 4 comandos en orden (cambiando `1.0.4` por la versión que corresponda):
```powershell
git add -A
git commit -m "release: v1.0.4 - descripcion de los cambios"
git tag v1.0.4
git push origin main --tags
```

### Paso 4: Publicar los 3 archivos en GitHub Releases
1. Entra a tu repositorio en internet: `https://github.com/SYepesCommit/polichinelo-pos-app/releases`
2. Haz clic en **"Draft a new release"**.
3. En **"Choose a tag"**, selecciona el tag que acabas de subir (ej. `v1.0.4`).
4. En la sección de adjuntar archivos (**Attach binaries**), arrastra desde tu carpeta `release/1.0.4/` estos **3 archivos**:
   * `Polichinelo-POS-Windows-1.0.4-Setup.exe`
   * `Polichinelo-POS-Windows-1.0.4-Setup.exe.blockmap`
   * `latest.yml` *(⚠️ OBLIGATORIO: Sin este archivo `latest.yml`, el botón de actualizar de la tienda no detectará la nueva versión).*
5. Haz clic en el botón verde **"Publish release"**.

### Paso 5: Actualizar en la tienda
En el computador de la tienda, abre Polichinelo POS, toca el botón **"Actualizaciones"** en el Dashboard, espera a que descargue al 100% y dale a **"Instalar"**.

---

## 5. ¿Dónde se guardan los datos reales en el PC de la tienda?

Cuando el programa está instalado en el computador de la tienda, toda la información importante vive en la carpeta oculta `AppData\Roaming\polichinelo-pos-app`.

Para abrirla rápidamente en cualquier computador con Windows:
1. Presiona las teclas **`Windows + R`**.
2. Escribe `%APPDATA%\polichinelo-pos-app` y presiona **Enter**.

Ahí adentro encontrarás:
* 🗄️ **`pos_database.db`**: Es **TODA LA BASE DE DATOS** del negocio (clientes, productos, ventas, gastos, bancos). Si copias este archivo en una memoria USB, tienes todo el negocio respaldado.
* 🖼️ **`product_images/`**: Las fotos de los productos que hayas subido.
* 🔐 **`seguridad-pin.json`**: Donde se guarda el PIN del supervisor. *(Truco de emergencia: si algún día olvidan el PIN y no pueden entrar, borra este archivo `seguridad-pin.json` con el programa cerrado; al volver a abrirlo, el PIN volverá a ser el de fábrica: **`1234`**).*
* ⚙️ **`backup-config.json`**: Configuración de la carpeta a donde van los backups.

---

## 6. Cómo Restaurar una Copia de Seguridad (En caso de emergencia o cambio de PC)

Si el computador de la tienda se daña o lo formatean:
1. Instala Polichinelo POS en el computador nuevo usando el instalador `Setup.exe`.
2. Ábrelo una vez y ciérralo por completo.
3. Busca tu archivo de backup más reciente en Google Drive (se llaman por ejemplo `polichinelo_backup_2026-11-07_22-00-00.db`).
4. Cámbiale el nombre a **`pos_database.db`**.
5. Abre `%APPDATA%\polichinelo-pos-app` (`Windows + R` -> `%APPDATA%\polichinelo-pos-app`) y pega ahí tu archivo `pos_database.db` reemplazando el que estaba vacío.
6. ¡Listo! Al abrir Polichinelo POS estarán todas tus ventas, clientes y productos intactos.

---

## 7. Solución de Problemas Frecuentes (Troubleshooting)

### Problema 1: "No imprime en la impresora térmica"
* **Causa:** Windows cambió la impresora predeterminada o el cable USB se desconectó.
* **Solución:**
  1. Ve a *Configuración de Windows -> Bluetooth y dispositivos -> Impresoras y escáneres*.
  2. Asegúrate de que la impresora térmica aparezca conectada y márcala como **Predeterminada** (desactiva la casilla de Windows *"Permitir que Windows administre mi impresora predeterminada"*).

### Problema 2: "Al compilar (`pnpm run build`) sale un error de archivo bloqueado en `release/`"
* **Causa:** Quedó abierto el programa Polichinelo POS o el instalador en segundo plano.
* **Solución:** Corre este comando en PowerShell antes de `pnpm run build`:
  ```powershell
  Stop-Process -Name "Polichinelo POS" -Force -ErrorAction SilentlyContinue
  ```

### Problema 3: "El botón de Actualizaciones dice error o no baja la versión nueva"
* **Causa:** En el Release de GitHub faltó subir el archivo `latest.yml`, o se subió el `Setup.exe` de una versión anterior dentro de un tag nuevo.
* **Solución:** Edita el Release en GitHub y asegúrate de que tanto `latest.yml` como `Polichinelo-POS-Windows-X.X.X-Setup.exe` pertenezcan exactamente a la misma carpeta `release/X.X.X/`.
