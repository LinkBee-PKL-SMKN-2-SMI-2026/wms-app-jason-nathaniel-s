import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import type { GetSummaryQuery, GetLowStockQuery } from '../models/reporting.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getSummary = catchAsync(async (req, res) => {
  const { date } = req.query as unknown as GetSummaryQuery;

  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalProducts,
    totalCategories,
    totalLocations,
    totalUsers,
    inboundToday,
    outboundToday,
  ] = await Promise.all([
    prisma.products.count(),
    prisma.categories.count(),
    prisma.locations.count(),
    prisma.users.count(),
    prisma.stock_Movements.aggregate({
      where: {
        type: 'INBOUND',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { quantity: true },
    }),
    prisma.stock_Movements.aggregate({
      where: {
        type: 'OUTBOUND',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { quantity: true },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Summary retrieved successfully',
    data: {
      totalProducts,
      totalCategories,
      totalLocations,
      totalStockInboundToday: inboundToday._sum.quantity ?? 0,
      totalStockOutboundToday: outboundToday._sum.quantity ?? 0,
      totalUsers,
    },
  });
});

export const getLowStock = catchAsync(async (req, res) => {
  const { threshold, page, limit } = req.query as unknown as GetLowStockQuery;

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: {
        stock: { lt: threshold },
        isActive: true,
      },
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.products.count({
      where: {
        stock: { lt: threshold },
        isActive: true,
      },
    }),
  ]);

  const data = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    minimumStock: product.minimumStock,
    categoryName: product.category?.name ?? '-',
    locationName: product.location?.name ?? '-',
  }));

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil data produk stok rendah',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});