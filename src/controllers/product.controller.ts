import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import type {
  CreateProductRequest,
  GetAllProductQuery,
  GetProductByIdParams,
  UpdateProductRequest,
  UpdateProductParams,
  DeleteProductParams,
} from '../models/product.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createProduct = catchAsync(async (req, res) => {
  const { name, sku, description, stock, minimumStock, categoryId, locationId } =
    req.body as CreateProductRequest;

  const category = await prisma.categories.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 400);
  }

  const location = await prisma.locations.findUnique({ where: { id: locationId } });
  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 400);
  }

  const existingSku = await prisma.products.findUnique({ where: { sku } });
  if (existingSku) {
    throw new AppError('SKU sudah ada', 409);
  }

  const product = await prisma.products.create({
    data: {
      name,
      sku,
      description,
      stock,
      minimumStock,
      categoryId,
      locationId,
    },
  });

  logger.info({ event: 'PRODUCT_CREATED', id: product.id }, `Produk ${name} berhasil dibuat`);

  res.status(201).json({
    success: true,
    message: 'Produk berhasil dibuat',
    data: product,
  });
});

export const getAllProducts = catchAsync(async (req, res) => {
  const { page, limit, search, sort, categoryId, locationId } =
    req.query as unknown as GetAllProductQuery;

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (locationId) {
    where.locationId = locationId;
  }

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy: { name: sort },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.products.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil data produk',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as GetProductByIdParams;

  const product = await prisma.products.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
    },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil detail produk',
    data: product,
  });
});

export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as UpdateProductParams;
  const { name, sku, description, minimumStock, categoryId, locationId } =
    req.body as UpdateProductRequest;

  const existing = await prisma.products.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const category = await prisma.categories.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 400);
  }

  const location = await prisma.locations.findUnique({ where: { id: locationId } });
  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 400);
  }

  if (sku !== existing.sku) {
    const duplicateSku = await prisma.products.findFirst({
      where: { sku, id: { not: id } },
    });
    if (duplicateSku) {
      throw new AppError('SKU sudah digunakan', 409);
    }
  }

  const updated = await prisma.products.update({
    where: { id },
    data: {
      name,
      sku,
      description,
      minimumStock,
      categoryId,
      locationId,
    },
  });

  logger.info({ event: 'PRODUCT_UPDATED', id }, `Produk ${id} berhasil diupdate`);

  res.status(200).json({
    success: true,
    message: 'Produk berhasil diupdate',
    data: updated,
  });
});

export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as DeleteProductParams;

  const existing = await prisma.products.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const stockMovementsCount = await prisma.stock_Movements.count({
    where: { productId: id },
  });

  if (stockMovementsCount > 0) {
    throw new AppError('Tidak bisa menghapus produk karena masih ada riwayat stok', 400);
  }

  await prisma.products.delete({ where: { id } });

  logger.info({ event: 'PRODUCT_DELETED', id }, `Produk ${id} berhasil dihapus`);

  res.status(200).json({
    success: true,
    message: 'Produk berhasil dihapus',
    data: null,
  });
});
