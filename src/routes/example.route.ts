import { Router } from 'express';
import {
  CreateExampleSchema,
  GetAllExampleSchema,
  GetExampleByIdSchema,
  UpdateExampleSchema,
  PartialUpdateExampleSchema,
  DeleteExampleSchema,
  BulkCreateExampleSchema,
  CreateExampleWithItemsSchema,
} from '../validations/example.validation';
import {
  createExample,
  getAllExamples,
  getExampleById,
  updateExample,
  partialUpdateExample,
  deleteExample,
  bulkCreateExamples,
  createExampleWithItems,
} from '../controllers/example.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { AppError } from '../utils/AppError';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(GetAllExampleSchema),
  getAllExamples,
);

router.get('/:id', authenticate,validate(GetExampleByIdSchema), getExampleById);

router.post('/', authenticate, authorize('ADMIN'), validate(CreateExampleSchema), createExample);

router.post('/bulk', authenticate, authorize('ADMIN'), validate(BulkCreateExampleSchema), bulkCreateExamples);

router.post('/with-items', authenticate, authorize('ADMIN'), validate(CreateExampleWithItemsSchema), createExampleWithItems);

router.get('/:id', authenticate,validate(GetExampleByIdSchema), getExampleById);

router.put('/:id', authenticate, authorize('ADMIN'), validate(UpdateExampleSchema), updateExample);

router.patch('/:id', authenticate, authorize('ADMIN'), validate(PartialUpdateExampleSchema), partialUpdateExample);

router.delete('/:id', authenticate, authorize('ADMIN'), validate(DeleteExampleSchema), deleteExample);

router.all('/*path', (req, res, next) => {
  next(new AppError(`Method ${req.method} tidak diizinkan di endpoint ini`, 405));
});

export default router;
