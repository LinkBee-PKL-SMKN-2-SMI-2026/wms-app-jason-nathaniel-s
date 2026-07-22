import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai melakukan seeding data...');

  // Seed Example 1
  const example1 = await prisma.example.upsert({
    where: { name: 'Laptop Asus ROG' },
    update: {},
    create: {
      name: 'Laptop Asus ROG',
      description: 'Laptop gaming performa tinggi',
      isActive: true,
      items: {
        create: [
          { productName: 'Laptop ROG Strix G16', quantity: 5, price: 18000000 },
          { productName: 'Mouse ROG Gladius', quantity: 10, price: 850000 },
          { productName: 'Keyboard ROG Falchion', quantity: 8, price: 1200000 },
        ],
      },
    },
    include: { items: true },
  });

  // Seed Example 2
  const example2 = await prisma.example.upsert({
    where: { name: 'Printer Epson L3210' },
    update: {},
    create: {
      name: 'Printer Epson L3210',
      description: 'Printer multifungsi untuk kantor',
      isActive: true,
      items: {
        create: [
          { productName: 'Printer Epson L3210', quantity: 3, price: 3500000 },
          { productName: 'Tinta Botol 664', quantity: 20, price: 75000 },
        ],
      },
    },
    include: { items: true },
  });

  // Seed Example 3
  const example3 = await prisma.example.upsert({
    where: { name: 'Monitor Samsung 24 inch' },
    update: {},
    create: {
      name: 'Monitor Samsung 24 inch',
      description: 'Monitor LED full HD',
      isActive: false,
      items: {
        create: [
          { productName: 'Samsung Odyssey G3 24"', quantity: 7, price: 2800000 },
        ],
      },
    },
    include: { items: true },
  });

  console.log('✅ Seeding selesai! Data yang dibuat:');
  console.log({ example1, example2, example3 });
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
