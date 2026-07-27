import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai melakukan seeding data...');

  // ==========================
  // USER ADMIN
  // ==========================
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.users.upsert({
    where: {
      email: 'admin@wms.com',
    },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@wms.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // ==========================
  // CATEGORIES
  // ==========================
  const elektronik = await prisma.categories.upsert({
    where: { name: 'Elektronik' },
    update: {},
    create: {
      name: 'Elektronik',
      description: 'Kategori barang elektronik',
    },
  });

  const furniture = await prisma.categories.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: {
      name: 'Furniture',
      description: 'Kategori furniture',
    },
  });

  const atk = await prisma.categories.upsert({
    where: { name: 'ATK' },
    update: {},
    create: {
      name: 'ATK',
      description: 'Alat Tulis Kantor',
    },
  });

  // ==========================
  // LOCATIONS
  // ==========================
  const rakA1 = await prisma.locations.upsert({
    where: { code: 'A1' },
    update: {},
    create: {
      name: 'Rak A1',
      code: 'A1',
    },
  });

  const rakA2 = await prisma.locations.upsert({
    where: { code: 'A2' },
    update: {},
    create: {
      name: 'Rak A2',
      code: 'A2',
    },
  });

  const gudangB1 = await prisma.locations.upsert({
    where: { code: 'B1' },
    update: {},
    create: {
      name: 'Gudang B1',
      code: 'B1',
    },
  });

  // ==========================
  // PRODUCTS
  // ==========================
  await prisma.products.createMany({
    data: [
      {
        name: 'Laptop ASUS',
        sku: 'SKU001',
        description: 'Laptop ASUS Core i7',
        stock: 15,
        minimumStock: 5,
        categoryId: elektronik.id,
        locationId: rakA1.id,
      },
      {
        name: 'Mouse Logitech',
        sku: 'SKU002',
        description: 'Mouse Wireless',
        stock: 30,
        minimumStock: 10,
        categoryId: elektronik.id,
        locationId: rakA1.id,
      },
      {
        name: 'Meja Kantor',
        sku: 'SKU003',
        description: 'Meja kerja',
        stock: 10,
        minimumStock: 3,
        categoryId: furniture.id,
        locationId: gudangB1.id,
      },
      {
        name: 'Kursi Kantor',
        sku: 'SKU004',
        description: 'Kursi ergonomis',
        stock: 12,
        minimumStock: 4,
        categoryId: furniture.id,
        locationId: rakA2.id,
      },
      {
        name: 'Pulpen Pilot',
        sku: 'SKU005',
        description: 'Pulpen tinta hitam',
        stock: 100,
        minimumStock: 20,
        categoryId: atk.id,
        locationId: rakA2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed berhasil!');
  console.log({
    admin,
    categories: 3,
    locations: 3,
    products: 5,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });