import { db } from './index'

async function main() {
  // Create a default user for development
  const user = await db.user.upsert({
    where: { email: 'dev@circuithub.local' },
    update: {},
    create: {
      email: 'dev@circuithub.local',
      name: 'Developer User',
      password: '$argon2id$v=19$m=65536,t=3,p=4$examplehash', // This should be a proper Argon2id hash
    },
  })

  // Create a default library
  const library = await db.library.upsert({
    where: { id: 'default-library' },
    update: {},
    create: {
      id: 'default-library',
      ownerId: user.id,
      name: 'Default Components',
      description: 'Default component library for development',
    },
  })

  // Create some sample components
  const resistor = await db.component.upsert({
    where: { 
      libraryId_mpn: { 
        libraryId: library.id, 
        mpn: 'RC0603FR-0710KL' 
      } 
    },
    update: {},
    create: {
      libraryId: library.id,
      refInternal: 'R_10k_0603',
      mpn: 'RC0603FR-0710KL',
      footprint: '0603',
      attributes: {
        tolerance: '1%',
        power: '0.1W',
        voltage: '50V'
      },
      unitPrice: 0.012,
      currency: 'EUR',
      suppliers: [
        {
          name: 'LCSC',
          url: 'https://www.lcsc.com/product-detail/Resistors_C25804.html',
          sku: 'C25804'
        }
      ],
      stock: 150,
    },
  })

  const capacitor = await db.component.upsert({
    where: { 
      libraryId_mpn: { 
        libraryId: library.id, 
        mpn: 'CL10A106KP8NNNC' 
      } 
    },
    update: {},
    create: {
      libraryId: library.id,
      refInternal: 'C_10uF_0603',
      mpn: 'CL10A106KP8NNNC',
      footprint: '0603',
      attributes: {
        capacitance: '10µF',
        voltage: '6.3V',
        tolerance: '10%'
      },
      unitPrice: 0.03,
      currency: 'EUR',
      suppliers: [
        {
          name: 'LCSC',
          url: 'https://www.lcsc.com/product-detail/Capacitors_C15849.html',
          sku: 'C15849'
        }
      ],
      stock: 100,
    },
  })

  console.log('Database seeded successfully!')
  console.log('User:', user)
  console.log('Library:', library)
  console.log('Components:', { resistor, capacitor })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })