import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { logActivity } from '../services/activity-log.service';
import type { AuthRequest, TokenPayload } from '../models/auth.model';
import type {
  CreateInboundRequest,
  CreateOutboundRequest,
  GetMovementHistoryQuery,
} from '../models/stock-movement.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createInbound = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.user as TokenPayload;
  const { productId, quantity, notes } = req.body as CreateInboundRequest;

  const result = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.products.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });

    const movement = await tx.stock_Movements.create({
      data: {
        type: 'INBOUND',
        quantity,
        notes,
        userId,
        productId,
      },
    });

    if (userId) {
      logActivity({
        userId,
        action: 'CREATE',
        entity: 'Stock_Movements',
        entityId: movement.id,
        detail: { type: 'INBOUND', productId, quantity },
      });
    }

    return { movement, updatedProduct };
  });

  logger.info(
    { event: 'INBOUND_SUCCESS', productId, quantity },
    `Stok masuk ${quantity} untuk produk ${productId}`,
  );

  res.status(201).json({
    success: true,
    message: 'Stok berhasil ditambah',
    data: result,
  });
});

export const createOutbound = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.user as TokenPayload;
  const { productId, quantity, notes } = req.body as CreateOutboundRequest;

  const product = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Stok tidak mencukupi', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.products.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    const movement = await tx.stock_Movements.create({
      data: {
        type: 'OUTBOUND',
        quantity,
        notes,
        userId,
        productId,
      },
    });

    if (userId) {
      logActivity({
        userId,
        action: 'CREATE',
        entity: 'Stock_Movements',
        entityId: movement.id,
        detail: { type: 'OUTBOUND', productId, quantity },
      });
    }

    return { movement, updatedProduct };
  });

  logger.info(
    { event: 'OUTBOUND_SUCCESS', productId, quantity },
    `Stok keluar ${quantity} untuk produk ${productId}`,
  );

  res.status(201).json({
    success: true,
    message: 'Stok berhasil dikurangi',
    data: result,
  });
});

export const getMovementHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page, limit, productId, type, startDate, endDate } =
    req.query as unknown as GetMovementHistoryQuery;

  const where: Record<string, unknown> = {};

  if (productId) {
    where.productId = productId;
  }
  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
    }
    if (endDate) {
      (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }
  }

  const [data, total] = await Promise.all([
    prisma.stock_Movements.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stock_Movements.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil riwayat stok',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
