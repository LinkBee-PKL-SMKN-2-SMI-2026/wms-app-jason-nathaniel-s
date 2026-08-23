import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';
import { AppError } from '../utils/AppError';
import {
  GetDashboardStatsSchema,
  GetRecentMovementsSchema,
} from '../validations/dashboard.validation';
import { getDashboardStats, getRecentMovements } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', authenticate, validate(GetDashboardStatsSchema), getDashboardStats);
router.get(
  '/recent-movements',
  authenticate,
  validate(GetRecentMovementsSchema),
  getRecentMovements,
);

router.all('/*path', (req, _res, next) => {
  next(new AppError(`Method ${req.method} tidak diizinkan di endpoint ini`, 405));
});

export default router;
