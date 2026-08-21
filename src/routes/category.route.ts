import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { AppError } from '../utils/AppError';
import {
  CreateCategorySchema,
  GetAllCategorySchema,
  GetCategoryByIdSchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from '../validations/category.validation';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';

const router = Router();

router.get('/', authenticate, validate(GetAllCategorySchema), getAllCategories);
router.get('/:id', authenticate, validate(GetCategoryByIdSchema), getCategoryById);
router.post('/', authenticate, authorize('ADMIN'), validate(CreateCategorySchema), createCategory);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(UpdateCategorySchema),
  updateCategory,
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(DeleteCategorySchema),
  deleteCategory,
);

router.all('/*path', (req, _res, next) => {
  next(new AppError(`Method ${req.method} tidak diizinkan di endpoint ini`, 405));
});

export default router;
