import bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt';

import type {
  RegisterRequest,
  LoginRequest,
} from '../models/auth.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body as RegisterRequest;

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError('Email sudah digunakan', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  logger.info(
    {
      event: 'REGISTER_SUCCESS',
      userId: user.id,
      email: user.email,
    },
    `User ${user.email} berhasil register`,
  );

  res.status(201).json({
    success: true,
    message: 'Register berhasil',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body as LoginRequest;

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isMatch) {
    throw new AppError('Email atau password salah', 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  logger.info(
    {
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      email: user.email,
    },
    `User ${user.email} berhasil login`,
  );

     res.status(200).json({
    success: true,
    message: 'Login berhasil',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
});