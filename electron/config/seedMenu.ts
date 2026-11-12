import { PrismaClient } from '@prisma/client'

/**
 * Siembra el catálogo oficial de Polichinelo en una base de datos recién instalada
 * (cuando Producto.count() === 0).
 */
export async function sembrarMenuInicial(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Base de datos vacía detectada: Sembrando catálogo oficial de Polichinelo...')

  // 1. Ingredientes globales
  const ingredientesBase = [
    'Salchicha Zenú',
    'Choricitos Cocteleros',
    'Salchicha Ranchera',
    'Salchicha Tradicional',
    '1 Huevito',
    'Papitas',
    'Tocineta',
    'Queso',
    'Ensalada',
    'Ripio de Papa',
    'Pollo',
    'Arepa con Queso',
    'Carne Desmechada',
    'Carne Artesanal de Churrasco',
    'Carne Artesanal de Tocineta',
    'Tomate',
    'Cebolla',
    'Hogao',
    'Maíz',
    'Salsa de la Casa',
    'Salsa Rosada',
    'Salsa de Piña',
    'Salsa Tártara',
    'Salsa BBQ',
    'Salsa Chimichurri',
  ]

  const ingMap = new Map<string, number>()
  for (const nombre of ingredientesBase) {
    const ing = await prisma.ingrediente.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
    ingMap.set(nombre, ing.id)
  }

  // 2. Categorías y Productos
  // 1. Salchipapas
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
                { ingredienteId: ingMap.get('Salchicha Zenú')! },
                { ingredienteId: ingMap.get('1 Huevito')! },
                { ingredienteId: ingMap.get('Papitas')! },
              ],
            },
          },
          {
            nombre: 'Chori-papa',
            precioVenta: 11000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Choricitos Cocteleros')! },
                { ingredienteId: ingMap.get('1 Huevito')! },
                { ingredienteId: ingMap.get('Papitas')! },
              ],
            },
          },
          {
            nombre: 'Salchipapa con Tocineta o Queso',
            precioVenta: 11000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Salchicha Zenú')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('1 Huevito')! },
                { ingredienteId: ingMap.get('Papitas')! },
              ],
            },
          },
          {
            nombre: 'Salchipapa Especial',
            precioVenta: 13000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Salchicha Zenú')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('1 Huevito')! },
                { ingredienteId: ingMap.get('Papitas')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 2. Picadas
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
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Salchicha Zenú')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('1 Huevito')! },
              ],
            },
          },
          {
            nombre: 'Granpolipicada',
            precioVenta: 21000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Salchicha Zenú')! },
                { ingredienteId: ingMap.get('Choricitos Cocteleros')! },
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('Ensalada')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 3. Carnes
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
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
              ],
            },
          },
          {
            nombre: 'Pechuga Gratinada',
            precioVenta: 22000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
              ],
            },
          },
          {
            nombre: 'Chuleta de Cerdo 300g',
            precioVenta: 22000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
              ],
            },
          },
          {
            nombre: 'Costichi 300g',
            precioVenta: 23500,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
              ],
            },
          },
          {
            nombre: 'Churrasco 250g',
            precioVenta: 26500,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
              ],
            },
          },
          {
            nombre: 'Arepa con Queso, Carne Desmechada y Pollo',
            precioVenta: 17500,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Arepa con Queso')! },
                { ingredienteId: ingMap.get('Carne Desmechada')! },
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Papitas')! },
              ],
            },
          },
          {
            nombre: 'Arepaburguer',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Papitas')! },
                { ingredienteId: ingMap.get('Arepa con Queso')! },
                { ingredienteId: ingMap.get('Ensalada')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 4. Hamburguesas
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
                { ingredienteId: ingMap.get('Carne Artesanal de Churrasco')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Tomate')! },
                { ingredienteId: ingMap.get('Cebolla')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
              ],
            },
          },
          {
            nombre: 'Hamburguesa de Tocineta',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Carne Artesanal de Tocineta')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Tomate')! },
                { ingredienteId: ingMap.get('Cebolla')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
              ],
            },
          },
          {
            nombre: 'Hamburguesa de Pollo',
            precioVenta: 19000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Tomate')! },
                { ingredienteId: ingMap.get('Cebolla')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 5. Perros Calientes
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
                { ingredienteId: ingMap.get('Salchicha Tradicional')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
              ],
            },
          },
          {
            nombre: 'Perro Ranchero',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Salchicha Ranchera')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
              ],
            },
          },
          {
            nombre: 'Perra',
            precioVenta: 15000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 6. Especiales
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
                { ingredienteId: ingMap.get('Carne Desmechada')! },
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Hogao')! },
                { ingredienteId: ingMap.get('Ensalada')! },
                { ingredienteId: ingMap.get('Ripio de Papa')! },
                { ingredienteId: ingMap.get('Queso')! },
              ],
            },
          },
          {
            nombre: 'Maicitos',
            precioVenta: 16000,
            ingredientes: {
              create: [
                { ingredienteId: ingMap.get('Maíz')! },
                { ingredienteId: ingMap.get('Pollo')! },
                { ingredienteId: ingMap.get('Tocineta')! },
                { ingredienteId: ingMap.get('Queso')! },
                { ingredienteId: ingMap.get('Salsa de la Casa')! },
              ],
            },
          },
        ],
      },
    },
  })

  // 7. Porciones / Adiciones
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

  console.log('✅ Catálogo oficial de Polichinelo sembrado con éxito.')
}
