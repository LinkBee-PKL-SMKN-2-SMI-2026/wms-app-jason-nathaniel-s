import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import type {
  CreateLocationRequest,
  GetAllLocationQuery,
  GetLocationByIdParams,
  UpdateLocationRequest,
  UpdateLocationParams,
  DeleteLocationParams,
} from '../models/location.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createLocation = catchAsync(async (req, res) => {
  const { name, code } = req.body as CreateLocationRequest;

  const existingName = await prisma.locations.findUnique({ where: { name } });
  if (existingName) {
    throw new AppError('Nama lokasi sudah ada', 409);
  }

  const existingCode = await prisma.locations.findUnique({ where: { code } });
  if (existingCode) {
    throw new AppError('Kode lokasi sudah ada', 409);
  }

  const location = await prisma.locations.create({
    data: { name, code },
  });

  logger.info({ event: 'LOCATION_CREATED', id: location.id }, `Lokasi ${name} berhasil dibuat`);

  res.status(201).json({
    success: true,
    message: 'Lokasi berhasil dibuat',
    data: location,
  });
});

export const getAllLocations = catchAsync(async (req, res) => {
  const { page, limit, search, sort } = req.query as unknown as GetAllLocationQuery;

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.locations.findMany({
      where,
      orderBy: { name: sort },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.locations.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil data lokasi',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getLocationById = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as GetLocationByIdParams;

  const location = await prisma.locations.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Berhasil mengambil detail lokasi',
    data: location,
  });
});

export const updateLocation = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as UpdateLocationParams;
  const { name, code, isActive } = req.body as UpdateLocationRequest;

  const existing = await prisma.locations.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  if (name !== existing.name) {
    const duplicateName = await prisma.locations.findFirst({
      where: { name, id: { not: id } },
    });
    if (duplicateName) {
      throw new AppError('Nama lokasi sudah digunakan', 409);
    }
  }

  if (code !== existing.code) {
    const duplicateCode = await prisma.locations.findFirst({
      where: { code, id: { not: id } },
    });
    if (duplicateCode) {
      throw new AppError('Kode lokasi sudah digunakan', 409);
    }
  }

  const updated = await prisma.locations.update({
    where: { id },
    data: { name, code, isActive },
  });

  logger.info({ event: 'LOCATION_UPDATED', id }, `Lokasi ${id} berhasil diupdate`);

  res.status(200).json({
    success: true,
    message: 'Lokasi berhasil diupdate',
    data: updated,
  });
});

export const deleteLocation = catchAsync(async (req, res) => {
  const { id } = req.params as unknown as DeleteLocationParams;

  const existing = await prisma.locations.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  const productsCount = await prisma.products.count({
    where: { locationId: id },
  });

  if (productsCount > 0) {
    throw new AppError('Tidak bisa menghapus lokasi karena masih ada produk yang terkait', 400);
  }

  await prisma.locations.delete({ where: { id } });

  logger.info({ event: 'LOCATION_DELETED', id }, `Lokasi ${id} berhasil dihapus`);

  res.status(200).json({
    success: true,
    message: 'Lokasi berhasil dihapus',
    data: null,
  });
});
