import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import type {
  CreateCategoryRequest,
  GetAllCategoryQuery,
  GetCategoryByIdParams,
  UpdateCategoryRequest,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from '../models/category.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body as CreateCategoryRequest;

  const existing = await prisma.categories.findUnique({ where: { name } });
  if (existing) {
    throw new AppError('Nama kategori sudah ada', 409);
  }

  const category = await prisma.categories.create({
    data: { name, description },
  });

  logger.info({ event: 'CATEGORY_CREATED', id: category.id }, `Kategori ${name} berhasil dibuat`);

  res.status(201).json({
    success: true,
    message: 'Kategori berhasil dibuat',
    data: category,
  });
});

export const getAllCategories = catchAsync(async (req, res) => {
  const { page, limit, search, sort } = req.query as unknown as GetAllCategoryQuery;

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.categories.findMany({
      where,
      orderBy: { name: sort },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.categories.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil data kategori',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as GetCategoryByIdParams;

  const category = await prisma.categories.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil detail kategori',
    data: category,
  });
});

export const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as UpdateCategoryParams;
  const { name, description, isActive } = req.body as UpdateCategoryRequest;

  const existing = await prisma.categories.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  if (name !== existing.name) {
    const duplicate = await prisma.categories.findFirst({
      where: { name, id: { not: id } },
    });
    if (duplicate) {
      throw new AppError('Nama kategori sudah digunakan', 409);
    }
  }

  const updated = await prisma.categories.update({
    where: { id },
    data: { name, description, isActive },
  });

  logger.info({ event: 'CATEGORY_UPDATED', id }, `Kategori ${id} berhasil diupdate`);

  res.status(200).json({
    success: true,
    message: 'Kategori berhasil diupdate',
    data: updated,
  });
});

export const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as DeleteCategoryParams;

  const existing = await prisma.categories.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  const productsCount = await prisma.products.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    throw new AppError(
      'Tidak bisa menghapus kategori karena masih ada produk yang terkait',
      400,
    );
  }

  await prisma.categories.delete({ where: { id } });

  logger.info({ event: 'CATEGORY_DELETED', id }, `Kategori ${id} berhasil dihapus`);

  res.status(200).json({
    success: true,
    message: 'Kategori berhasil dihapus',
    data: null,
  });
});