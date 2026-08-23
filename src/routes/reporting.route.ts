import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { GetSummarySchema, GetLowStockSchema } from '../validations/reporting.validation';
import { getSummary, getLowStock } from '../controllers/reporting.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router = Router();

router.get('/summary', authenticate, validate(GetSummarySchema), getSummary);
router.get('/low-stock', authenticate, validate(GetLowStockSchema), getLowStock);

export default router;