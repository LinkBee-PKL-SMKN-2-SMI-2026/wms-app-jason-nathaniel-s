import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  detail?: any;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    await prisma.activity_Logs.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        detail: params.detail ?? undefined,
        userId: params.userId,
      },
    });
  } catch (error) {
    logger.error({ event: 'ACTIVITY_LOG_ERROR', error }, 'Gagal mencatat activity log');
  }
};