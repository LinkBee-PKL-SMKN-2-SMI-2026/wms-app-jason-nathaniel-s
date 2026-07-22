import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import type {
  CreateExampleRequest,
  GetAllExampleQuery,
  GetExampleByIdParams,
  UpdateExampleRequest,
  UpdateExampleParams,
  PartialUpdateExampleRequest,
  PartialUpdateExampleParams,
  DeleteExampleParams,
  BulkCreateExampleRequest,
  CreateExampleWithItemsRequest,
} from '../types/example.dto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ===========================
// POST /api/example/ - Create Single
// ===========================

export const createExample = catchAsync(async (req, res) => {
  const { name, description, isActive } = req.body as CreateExampleRequest;

  const isExist = await prisma.example.findUnique({ where: { name } });
  if (isExist) {
    throw new AppError(`Data dengan nama ${name} sudah ada`, 409);
  }

  const newExample = await prisma.example.create({
    data: { name, description, isActive },
  });

  logger.info({ event: 'Example Created', newExample }, `Example ${name} berhasil dibuat`);

  res.status(201).json({
    success: true,
    message: 'Example created successfully',
    data: newExample,
  });
});

// ===========================
// GET /api/example/ - Get All (Query: pagination, search, filter, sort)
// ===========================

export const getAllExamples = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    sort = 'asc',
    isActive,
  } = req.query as unknown as GetAllExampleQuery;

  const where: Record<string, unknown> = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.example.findMany({
      where,
      orderBy: { name: sort },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.example.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  logger.info(
    {
      event: 'Examples Fetched',
      page,
      limit,
      total,
      search: search ?? null,
    },
    'Berhasil mengambil data examples',
  );

  res.status(200).json({
    success: true,
    message: 'Examples retrieved successfully',
    data,
    pagination: { page, limit, total, totalPages },
  });
});

// ===========================
// GET /api/example/:id - Get By ID
// ===========================

export const getExampleById = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as GetExampleByIdParams;

  const example = await prisma.example.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!example) {
    throw new AppError(`Example dengan ID ${id} tidak ditemukan`, 404);
  }

  logger.info({ event: 'Example Fetched', id }, `Example ${id} berhasil diambil`);

  res.status(200).json({
    success: true,
    message: 'Example retrieved successfully',
    data: example,
  });
});

// ===========================
// PUT /api/example/:id - Full Update
// ===========================

export const updateExample = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as UpdateExampleParams;
  const { name, description, isActive } = req.body as UpdateExampleRequest;

  const existing = await prisma.example.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(`Example dengan ID ${id} tidak ditemukan`, 404);
  }

  const duplicate = await prisma.example.findFirst({
    where: { name, id: { not: id } },
  });
  if (duplicate) {
    throw new AppError(`Nama ${name} sudah digunakan oleh data lain`, 409);
  }

  const updatedExample = await prisma.example.update({
    where: { id },
    data: { name, description, isActive },
  });

  logger.info({ event: 'Example Updated', updatedExample }, `Example ${id} berhasil diupdate`);

  res.status(200).json({
    success: true,
    message: 'Example updated successfully',
    data: updatedExample,
  });
});

// ===========================
// PATCH /api/example/:id - Partial Update
// ===========================

export const partialUpdateExample = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as PartialUpdateExampleParams;
  const updates = req.body as PartialUpdateExampleRequest;

  const existing = await prisma.example.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(`Example dengan ID ${id} tidak ditemukan`, 404);
  }

  if (updates.name) {
    const duplicate = await prisma.example.findFirst({
      where: { name: updates.name, id: { not: id } },
    });
    if (duplicate) {
      throw new AppError(`Nama ${updates.name} sudah digunakan oleh data lain`, 409);
    }
  }

  const updatedExample = await prisma.example.update({
    where: { id },
    data: updates,
  });

  logger.info(
    { event: 'Example Partially Updated', updatedExample },
    `Example ${id} berhasil diupdate sebagian`,
  );

  res.status(200).json({
    success: true,
    message: 'Example partially updated successfully',
    data: updatedExample,
  });
});

// ===========================
// DELETE /api/example/:id - Delete
// ===========================

export const deleteExample = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as DeleteExampleParams;

  const existing = await prisma.example.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(`Example dengan ID ${id} tidak ditemukan`, 404);
  }

  const deletedExample = await prisma.example.delete({ where: { id } });

  logger.info({ event: 'Example Deleted', deletedExample }, `Example ${id} berhasil dihapus`);

  res.status(200).json({
    success: true,
    message: 'Example deleted successfully',
    data: deletedExample,
  });
});

// ===========================
// POST /api/example/bulk - Bulk Create (Array Body)
// ===========================

export const bulkCreateExamples = catchAsync(async (req, res) => {
  const { items } = req.body as BulkCreateExampleRequest;

  const created: Awaited<ReturnType<typeof prisma.example.create>>[] = [];
  const failed: Array<{ index: number; name: string; reason: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;

    const isExist = await prisma.example.findUnique({ where: { name: item.name } });
    if (isExist) {
      failed.push({ index: i, name: item.name, reason: `Nama ${item.name} sudah ada` });
      continue;
    }

    const newExample = await prisma.example.create({
      data: {
        name: item.name,
        description: item.description,
        isActive: item.isActive,
      },
    });

    created.push(newExample);
  }

  if (created.length > 0) {
    logger.info(
      { event: 'Bulk Create Success', count: created.length },
      `${created.length} dari ${items.length} item berhasil dibuat`,
    );
  }

  if (failed.length > 0) {
    logger.warn(
      { event: 'Bulk Create Partial Fail', failed },
      `${failed.length} dari ${items.length} item gagal dibuat`,
    );
  }

  res.status(201).json({
    success: true,
    message: `${created.length} item berhasil dibuat, ${failed.length} item gagal`,
    data: created,
    failed,
  });
});

// ===========================
// POST /api/example/with-items - Nested Object Validation
// ===========================

export const createExampleWithItems = catchAsync(async (req, res) => {
  const { name, category, items } = req.body as CreateExampleWithItemsRequest;

  const isExist = await prisma.example.findUnique({ where: { name } });
  if (isExist) {
    throw new AppError(`Data dengan nama ${name} sudah ada`, 409);
  }

  const seenProducts = new Map<string, number>();
  for (const item of items) {
    const existing = seenProducts.get(item.productName);
    if (existing) {
      throw new AppError(
        `Product "${item.productName}" muncul lebih dari sekali, gunakan quantity yang benar`,
        400,
      );
    }
    seenProducts.set(item.productName, item.quantity);
  }

  const newExample = await prisma.example.create({
    data: {
      name,
      isActive: true,
      items: {
        create: items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  logger.info(
    {
      event: 'Example With Items Created',
      id: newExample.id,
      name,
      itemCount: items.length,
    },
    `Example "${name}" dengan ${items.length} item berhasil dibuat`,
  );

  res.status(201).json({
    success: true,
    message: 'Example with items created successfully',
    data: {
      id: newExample.id,
      name,
      category,
      items: newExample.items,
      totalItems,
      totalValue,
    },
  });
});
