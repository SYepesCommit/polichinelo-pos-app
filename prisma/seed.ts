import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Configuración LibSQL para SQLite local
const adapter = new PrismaLibSql({
  url: 'file:polichinelo.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Limpiando base de datos previa...')
  await prisma.productoIngrediente?.deleteMany()
  await prisma.ingrediente?.deleteMany()
  await prisma.pagoDetalle?.deleteMany()
  await prisma.pedidoDetalle?.deleteMany()
  await prisma.pedido?.deleteMany()
  await prisma.producto?.deleteMany()
  await prisma.categoria?.deleteMany()
  await prisma.banco?.deleteMany()
  await prisma.metodoPago?.deleteMany()

  console.log('💳 Creando métodos de pago dinámicos...')
  await prisma.metodoPago.create({
    data: {
      nombre: 'Efectivo',
      codigo: 'EFECTIVO',
      requiereBanco: false,
      activo: true,
      orden: 1,
    },
  })

  await prisma.metodoPago.create({
    data: {
      nombre: 'Transferencia',
      codigo: 'TRANSFERENCIA',
      requiereBanco: true,
      activo: true,
      orden: 2,
    },
  })

  console.log('🏦 Cargando entidades bancarias...')
  await prisma.banco.createMany({
    data: [
      { id: 'nequi', nombre: 'Nequi', activo: true },
      { id: 'bancolombia', nombre: 'Bancolombia', activo: true },
      { id: 'daviplata', nombre: 'Daviplata', activo: true },
      { id: 'breb', nombre: 'Bre-B / Transfiya', activo: true },
    ],
  })

  console.log('🥑 Creando catálogo global de ingredientes...')
  const ingSalchichaZenu = await prisma.ingrediente.create({ data: { nombre: 'Salchicha Zenú' } })
  const ingChoricitos = await prisma.ingrediente.create({ data: { nombre: 'Choricitos Cocteleros' } })
  const ingSalchichaRanchera = await prisma.ingrediente.create({ data: { nombre: 'Salchicha Ranchera' } })
  const ingSalchichaTradicional = await prisma.ingrediente.create({ data: { nombre: 'Salchicha Tradicional' } })
  const ingHuevito = await prisma.ingrediente.create({ data: { nombre: '1 Huevito' } })
  const ingPapitas = await prisma.ingrediente.create({ data: { nombre: 'Papitas' } })
  const ingTocineta = await prisma.ingrediente.create({ data: { nombre: 'Tocineta' } })
  const ingQueso = await prisma.ingrediente.create({ data: { nombre: 'Queso' } })
  const ingEnsalada = await prisma.ingrediente.create({ data: { nombre: 'Ensalada' } })
  const ingRipio = await prisma.ingrediente.create({ data: { nombre: 'Ripio de Papa' } })
  const ingPollo = await prisma.ingrediente.create({ data: { nombre: 'Pollo' } })
  const ingArepaQueso = await prisma.ingrediente.create({ data: { nombre: 'Arepa con Queso' } })
  const ingCarneDesmechada = await prisma.ingrediente.create({ data: { nombre: 'Carne Desmechada' } })
  const ingCarneChurrasco = await prisma.ingrediente.create({ data: { nombre: 'Carne Artesanal de Churrasco' } })
  const ingCarneTocineta = await prisma.ingrediente.create({ data: { nombre: 'Carne Artesanal de Tocineta' } })
  const ingTomate = await prisma.ingrediente.create({ data: { nombre: 'Tomate' } })
  const ingCebolla = await prisma.ingrediente.create({ data: { nombre: 'Cebolla' } })
  const ingHogao = await prisma.ingrediente.create({ data: { nombre: 'Hogao' } })
  const ingMaiz = await prisma.ingrediente.create({ data: { nombre: 'Maíz' } })
  const ingSalsaCasa = await prisma.ingrediente.create({ data: { nombre: 'Salsa de la Casa' } })

  console.log('🍔 Cargando categorías y productos del Menú Oficial...')

  // 1. SALCHIPAPAS
  await prisma.categoria.create({
    data: {
      nombre: 'Salchipapas',
      productos: {
        create: [
          {
            nombre: 'Salchipapa Sencilla',
            precioVenta: 9500,
            ingredientes: {
              create: [
                { ingredienteId: ingSalchichaZenu.id },
                { ingredienteId: ingHuevito.id },
                { ingredienteId: ingPapitas.id },
              ],
            },
          },
          {
            nombre: 'Chori-papa',
            precioVenta: 11000,
            ingredientes: {
              create: [
                { ingredienteId: ingChoricitos.id },
                { ingredienteId: ingHuevito.id },
                { ingredienteId: ingPapitas.id },
              ],
            },
          },
          {
            nombre: 'Salchipapa con Tocineta o Queso',
            precioVenta: 11000,
            ingredientes: {
              create: [
                { ingredienteId: ingSalchichaZenu.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingHuevito.id },
                { ingredienteId: ingPapitas.id },
              ],
            },
          },
          {
            nombre: 'Salchipapa Especial',
            precioVenta: 13000,
            ingredientes: {
              create: [
                { ingredienteId: ingSalchichaZenu.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingHuevito.id },
                { ingredienteId: ingPapitas.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 2. PICADAS
  await prisma.categoria.create({
    data: {
      nombre: 'Picadas',
      productos: {
        create: [
          {
            nombre: 'Minipolipicada',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingSalchichaZenu.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingHuevito.id },
              ],
            },
          },
          {
            nombre: 'Granpolipicada',
            precioVenta: 21000,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingSalchichaZenu.id },
                { ingredienteId: ingChoricitos.id },
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingEnsalada.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 3. CARNES
  await prisma.categoria.create({
    data: {
      nombre: 'Carnes',
      productos: {
        create: [
          {
            nombre: 'Chuzo de Pollo 250g',
            precioVenta: 22000,
            ingredientes: {
              create: [
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingArepaQueso.id },
              ],
            },
          },
          {
            nombre: 'Pechuga Gratinada',
            precioVenta: 22000,
            ingredientes: {
              create: [
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingArepaQueso.id },
              ],
            },
          },
          {
            nombre: 'Chuleta de Cerdo 300g',
            precioVenta: 22000,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingArepaQueso.id },
              ],
            },
          },
          {
            nombre: 'Costichi 300g',
            precioVenta: 23500,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingArepaQueso.id },
              ],
            },
          },
          {
            nombre: 'Churrasco 250g',
            precioVenta: 26500,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingArepaQueso.id },
              ],
            },
          },
          {
            nombre: 'Arepa con Queso, Carne Desmechada y Pollo',
            precioVenta: 17500,
            ingredientes: {
              create: [
                { ingredienteId: ingArepaQueso.id },
                { ingredienteId: ingCarneDesmechada.id },
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingPapitas.id },
              ],
            },
          },
          {
            nombre: 'Arepaburguer',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingPapitas.id },
                { ingredienteId: ingArepaQueso.id },
                { ingredienteId: ingEnsalada.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 4. HAMBURGUESAS ARTESANALES
  await prisma.categoria.create({
    data: {
      nombre: 'Hamburguesas',
      productos: {
        create: [
          {
            nombre: 'Hamburguesa de Churrasco',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingCarneChurrasco.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingTomate.id },
                { ingredienteId: ingCebolla.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
              ],
            },
          },
          {
            nombre: 'Hamburguesa de Tocineta',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingCarneTocineta.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingTomate.id },
                { ingredienteId: ingCebolla.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
              ],
            },
          },
          {
            nombre: 'Hamburguesa de Pollo',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingTomate.id },
                { ingredienteId: ingCebolla.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 5. PERROS CALIENTES (EXCLUSIVO PERROS)
  await prisma.categoria.create({
    data: {
      nombre: 'Perros Calientes',
      productos: {
        create: [
          {
            nombre: 'Perro Sencillo',
            precioVenta: 13500,
            ingredientes: {
              create: [
                { ingredienteId: ingSalchichaTradicional.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingRipio.id },
              ],
            },
          },
          {
            nombre: 'Perro Ranchero',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingSalchichaRanchera.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingRipio.id },
              ],
            },
          },
          {
            nombre: 'Perra',
            precioVenta: 15000,
            ingredientes: {
              create: [
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingRipio.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 6. ESPECIALES DE LA CASA (PATACONES, MAICITOS, Y ESPACIO PARA PLATO DEL DÍA)
  await prisma.categoria.create({
    data: {
      nombre: 'Especiales',
      productos: {
        create: [
          {
            nombre: 'Patacón',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingCarneDesmechada.id },
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingHogao.id },
                { ingredienteId: ingEnsalada.id },
                { ingredienteId: ingRipio.id },
                { ingredienteId: ingQueso.id },
              ],
            },
          },
          {
            nombre: 'Maicitos',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingMaiz.id },
                { ingredienteId: ingPollo.id },
                { ingredienteId: ingTocineta.id },
                { ingredienteId: ingQueso.id },
                { ingredienteId: ingSalsaCasa.id },
              ],
            },
          },
        ],
      },
    },
  })

  // 7. PORCIONES / ADICIONES CON PRECIO
  await prisma.categoria.create({
    data: {
      nombre: 'Porciones / Adiciones',
      productos: {
        create: [
          { nombre: 'Porción de Papas', precioVenta: 6000 },
          { nombre: 'Porción de Tocineta', precioVenta: 3500 },
          { nombre: 'Porción de Queso', precioVenta: 3500 },
          { nombre: 'Porción de Ensalada', precioVenta: 5000 },
          { nombre: 'Porción de Huevitos (3 Huevitos)', precioVenta: 2500 },
        ],
      },
    },
  })

  console.log('🚀 ¡Base de datos reestructurada con Perros y Especiales separados!')
}

main()
  .catch((e) => {
    console.error(e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })