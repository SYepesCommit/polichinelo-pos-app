# Polichinelo POS

Sistema Punto de Venta (POS) táctil de escritorio desarrollado con **Electron + React + TypeScript + Tailwind CSS + Prisma (SQLite / LibSQL)** para **Polichinelo**.

---

## Características Principales

- **Toma de Pedidos Táctil (POS)**:
  - Pedidos en **Mesa**, **Para Llevar** y **Domicilio**.
  - Búsqueda automática de clientes frecuentes por número de teléfono en domicilios.
  - Buscador rápido de platos e ingredientes (insensible a tildes) y filtro por categorías / Plato del Día.
  - Personalización de platos con adiciones dinámicas, ingredientes ("Sin...") y notas para cocina.
  - Calculadora táctil de cambio / vueltos para pagos en efectivo (`Exacto`, `$20k`, `$50k`, `$100k`).
- **Gestión de Caja, Ventas y Gastos**:
  - Cuadre de caja por turno (Efectivo Neto en Caja, Transferencias con desglose por entidad bancaria, Domicilios y Gastos).
  - Cambio rápido de método de pago o banco destino y anulación de órdenes protegida con **PIN de Supervisor**.
  - Exportación de reporte de cierre en PDF.
- **Catálogo de Productos e Ingredientes**:
  - Creación y edición de platos con fotografía local (`media://`), ingredientes globales y archivado inteligente (elimina físicamente si no tiene ventas históricas o archiva si ya tiene historial).
- **Respaldo Automático de Base de Datos (Google Drive / Local)**:
  - Organización inteligente por carpetas de fin de semana (`FinDeSemana_YYYY-MM-DD_al_YYYY-MM-DD`) con un archivo consolidado por noche (`1_Jueves`, `2_Viernes`, `3_Sabado`, `4_Domingo`).
  - Respaldo automático al abrir la app, cada 30 minutos al registrar ventas y al cerrar el programa.
- **Actualizaciones Automáticas (OTA)**:
  - Integrado con **GitHub Releases** (`electron-updater`) para descargar e instalar nuevas versiones en el PC táctil sin tocar la base de datos local.

---

##  Comandos de Desarrollo y Empaquetado

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run dev

# Compilar instalador local (.exe en carpeta release/)
pnpm run build

# Compilar y publicar nueva versión en GitHub Releases
pnpm run release
```

---

## Cómo Publicar una Nueva Versión (Auto-Update)

1. Incrementa la versión en `package.json` (por ejemplo de `"1.0.0"` a `"1.0.1"`).
2. Haz commit y sube los cambios a GitHub:
   ```bash
   git add .
   git commit -m "chore: release v1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```
3. Para subir el instalador `.exe` y el archivo `latest.yml` a GitHub Releases automáticamente:
   ```powershell
   $env:GH_TOKEN="tu_token_de_github"
   pnpm run release
   ```
   *(O ejecuta `pnpm run build` y adjunta manualmente los archivos `Polichinelo POS-Windows-X.X.X-Setup.exe`, `.blockmap` y `latest.yml` de la carpeta `release/X.X.X/` en el Release de GitHub).*
