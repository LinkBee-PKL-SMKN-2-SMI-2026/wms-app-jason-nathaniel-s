import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import type { GetDashboardStatsQuery, GetRecentMovementsQuery } from '../models/dashboard.dto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const getDashboardStats = catchAsync(async (req, res) => {
  const { period } = req.query as unknown as GetDashboardStatsQuery;
  const now = new Date();
  let dateFilter = new Date();

  switch (period) {
    case 'today':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const [overview, movementsRaw, topProductIds, categoryData] = await Promise.all([
    prisma.$queryRaw`SELECT COUNT(*)::int as "totalProducts", COALESCE(SUM(stock), 0)::int as "totalStock", COUNT(*) FILTER (WHERE stock < "minimumStock" AND stock > 0)::int as "lowStockCount", COUNT(*) FILTER (WHERE stock = 0)::int as "outOfStockCount" FROM "Products"`,
    prisma.$queryRaw`SELECT COALESCE(SUM(CASE WHEN type = 'INBOUND' THEN quantity ELSE 0 END), 0)::int as "totalInbound", COALESCE(SUM(CASE WHEN type = 'OUTBOUND' THEN quantity ELSE 0 END), 0)::int as "totalOutbound" FROM "Stock_Movements" WHERE "createdAt" >= ${dateFilter.toISOString()}`,
    prisma.stock_Movements.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: dateFilter } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.products.groupBy({ by: ['categoryId'], _sum: { stock: true }, _count: { id: true } }),
  ]);

  const movements = (movementsRaw as Array<{ totalInbound: number; totalOutbound: number }>)[0]!;
  const netMovement = movements.totalInbound - movements.totalOutbound;

  const topProducts = await prisma.products.findMany({
    where: { id: { in: topProductIds.map((p) => p.productId) } },
    select: { id: true, name: true, sku: true },
  });
  const topProductsWithMovement = topProductIds.map((p) => {
    const prod = topProducts.find((tp) => tp.id === p.productId);
    return {
      id: p.productId,
      name: prod?.name || 'Unknown',
      sku: prod?.sku || 'Unknown',
      totalMovement: p._sum.quantity,
    };
  });

  const categories = await prisma.categories.findMany({
    where: { id: { in: categoryData.map((c) => c.categoryId) } },
    select: { id: true, name: true },
  });
  const categoryDistribution = categoryData.map((c) => {
    const cat = categories.find((cat) => cat.id === c.categoryId);
    return {
      categoryName: cat?.name || 'Unknown',
      productCount: c._count.id,
      totalStock: c._sum.stock,
    };
  });

  const overviewData = (
    overview as Array<{
      totalProducts: number;
      totalStock: number;
      lowStockCount: number;
      outOfStockCount: number;
    }>
  )[0]!;

  res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      overview: overviewData,
      movements: { ...movements, netMovement },
      topProducts: topProductsWithMovement,
      categoryDistribution,
    },
  });
});

export const getRecentMovements = catchAsync(async (req, res) => {
  const { page, limit } = req.query as unknown as GetRecentMovementsQuery;
  const [data, total] = await Promise.all([
    prisma.stock_Movements.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.stock_Movements.count(),
  ]);
  res.status(200).json({
    success: true,
    message: 'Recent movements retrieved successfully',
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
