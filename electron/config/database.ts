import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { sembrarMenuInicial } from './seedMenu'

export function getDatabasePath(): string {
  // En desarrollo usamos la base de datos de la raíz del proyecto
  if (!app || !app.isPackaged) {
    const devDbPath = path.join(process.cwd(), 'polichinelo.db')
    if (fs.existsSync(devDbPath)) {
      return devDbPath
    }
  }

  // En producción (o si no existe en la raíz), persistir en AppData (userData)
  const userDataDir = app.getPath('userData')
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true })
  }
  const prodDbPath = path.join(userDataDir, 'polichinelo.db')

  // Si aún no existe en userData pero hay una plantilla en el bundle/raíz, copiarla
  if (!fs.existsSync(prodDbPath)) {
    const seedDbPath = path.join(process.cwd(), 'polichinelo.db')
    if (fs.existsSync(seedDbPath)) {
      try {
        fs.copyFileSync(seedDbPath, prodDbPath)
        console.log('📦 Base de datos inicial copiada a userData:', prodDbPath)
      } catch (err) {
        console.error('❌ Error copiando base de datos inicial a userData:', err)
      }
    }
  }

  return prodDbPath
}

const dbPath = getDatabasePath()
console.log('🗄️ Conectando SQLite en:', dbPath)

const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
})

export const prisma = new PrismaClient({ adapter })

/**
 * Garantiza que en una instalación limpia desde cero (PC nuevo sin polichinelo.db previo)
 * existan todas las tablas SQLite, métodos de pago y bancos por defecto antes de abrir la ventana.
 */
export async function ensureDatabaseReady(): Promise<void> {
  try {
    const rawClient = createClient({ url: `file:${dbPath}` })
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS "Categoria" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "nombre" TEXT NOT NULL,
        "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "Producto" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "categoriaId" INTEGER,
        "nombre" TEXT NOT NULL,
        "precioVenta" REAL NOT NULL,
        "costoBase" REAL NOT NULL DEFAULT 0,
        "esEspecial" BOOLEAN NOT NULL DEFAULT false,
        "activo" BOOLEAN NOT NULL DEFAULT true,
        "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "imagenUrl" TEXT,
        CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "Ingrediente" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "nombre" TEXT NOT NULL,
        "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Ingrediente_nombre_key" ON "Ingrediente"("nombre")`,
      `CREATE TABLE IF NOT EXISTS "ProductoIngrediente" (
        "productoId" INTEGER NOT NULL,
        "ingredienteId" INTEGER NOT NULL,
        PRIMARY KEY ("productoId", "ingredienteId"),
        CONSTRAINT "ProductoIngrediente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ProductoIngrediente_ingredienteId_fkey" FOREIGN KEY ("ingredienteId") REFERENCES "Ingrediente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "Cliente" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "telefono" TEXT NOT NULL,
        "nombre" TEXT NOT NULL,
        "direccion" TEXT NOT NULL,
        "referenciaDireccion" TEXT,
        "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Cliente_telefono_key" ON "Cliente"("telefono")`,
      `CREATE TABLE IF NOT EXISTS "Pedido" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "clienteId" INTEGER,
        "tipoPedido" TEXT NOT NULL DEFAULT 'LLEVAR',
        "detallesDestino" TEXT,
        "montoDomicilio" REAL DEFAULT 0,
        "estado" TEXT NOT NULL DEFAULT 'REALIZADO',
        "total" REAL NOT NULL DEFAULT 0,
        "motivoAnulacion" TEXT,
        "sincronizado" BOOLEAN NOT NULL DEFAULT false,
        "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "observacionesGenerales" TEXT,
        CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "PedidoDetalle" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "pedidoId" INTEGER NOT NULL,
        "productoId" INTEGER,
        "cantidad" INTEGER NOT NULL,
        "precioUnitario" REAL NOT NULL,
        "observaciones" TEXT,
        "subtotal" REAL NOT NULL,
        CONSTRAINT "PedidoDetalle_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PedidoDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "Banco" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nombre" TEXT NOT NULL,
        "activo" BOOLEAN NOT NULL DEFAULT true
      )`,
      `CREATE TABLE IF NOT EXISTS "PagoDetalle" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "pedidoId" INTEGER NOT NULL,
        "metodoPago" TEXT NOT NULL,
        "monto" REAL NOT NULL,
        "bancoId" TEXT,
        CONSTRAINT "PagoDetalle_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PagoDetalle_bancoId_fkey" FOREIGN KEY ("bancoId") REFERENCES "Banco" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "Gasto" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "descripcion" TEXT NOT NULL,
        "monto" REAL NOT NULL,
        "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "MetodoPago" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nombre" TEXT NOT NULL,
        "codigo" TEXT NOT NULL,
        "requiereBanco" BOOLEAN NOT NULL DEFAULT false,
        "activo" BOOLEAN NOT NULL DEFAULT true,
        "orden" INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "MetodoPago_codigo_key" ON "MetodoPago"("codigo")`,
      `CREATE INDEX IF NOT EXISTS "Pedido_fechaRegistro_idx" ON "Pedido"("fechaRegistro")`,
      `CREATE INDEX IF NOT EXISTS "Pedido_tipoPedido_idx" ON "Pedido"("tipoPedido")`,
      `CREATE INDEX IF NOT EXISTS "Pedido_estado_idx" ON "Pedido"("estado")`,
      `CREATE INDEX IF NOT EXISTS "Producto_categoriaId_idx" ON "Producto"("categoriaId")`,
      `CREATE INDEX IF NOT EXISTS "Producto_activo_idx" ON "Producto"("activo")`,
    ]

    for (const sql of ddlStatements) {
      await rawClient.execute(sql)
    }
    rawClient.close()

    // Sembrar métodos de pago y bancos base si la tabla está vacía
    const countMetodos = await prisma.metodoPago.count()
    if (countMetodos === 0) {
      await prisma.metodoPago.createMany({
        data: [
          { id: 'mp-efectivo', nombre: 'Efectivo', codigo: 'EFECTIVO', requiereBanco: false, activo: true, orden: 1 },
          { id: 'mp-transferencia', nombre: 'Transferencia', codigo: 'TRANSFERENCIA', requiereBanco: true, activo: true, orden: 2 },
        ],
      })
    }

    const countBancos = await prisma.banco.count()
    if (countBancos === 0) {
      await prisma.banco.createMany({
        data: [
          { id: 'nequi', nombre: 'Nequi', activo: true },
          { id: 'bancolombia', nombre: 'Bancolombia', activo: true },
          { id: 'daviplata', nombre: 'Daviplata', activo: true },
          { id: 'breb', nombre: 'Bre-B / Transfiya', activo: true },
        ],
      })
    }

    // Sembrar menú oficial completo (7 categorías, 26 productos e ingredientes) si no hay productos
    const countProductos = await prisma.producto.count()
    if (countProductos === 0) {
      await sembrarMenuInicial(prisma)
    }
  } catch (error) {
    console.error('❌ Error verificando esquema inicial de SQLite:', error)
  }
}
