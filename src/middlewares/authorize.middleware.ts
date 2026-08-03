import type { NextFunction, Response } from 'express';
import { AppError } from '../utils/AppError';
import type { AuthRequest } from '../models/auth.model';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    prisma.users
      .findUnique({
        where: { id: req.user.userId },
        select: { role: true, isActive: true },
      })
      .then((user) => {
        if (!user) {
          return next(new AppError('User tidak ditemukan', 401));
        }

        if (!user.isActive) {
          return next(new AppError('Akun tidak aktif', 403));
        }

        if (!roles.includes(user.role)) {
          return next(
            new AppError('Anda tidak memiliki akses ke resource ini', 403)
          );
        }

        next();
      })
      .catch((err) => {
        next(err);
      });
  };
};