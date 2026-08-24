import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import type { GetActivityLogsQuery } from '../models/activity-log.dto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const getActivityLogs = catchAsync(async (req, res) => {
  const { page, limit, userId, action, entity, startDate, endDate } =
    req.query as unknown as GetActivityLogsQuery;

  const where: Record<string, unknown> = {};
  if (userId) {
    where.userId = userId;
  }
  if (action) {
    where.action = action;
  }
  if (entity) {
    where.entity = entity;
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
    prisma.activity_Logs.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity_Logs.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Activity logs retrieved successfully',
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
