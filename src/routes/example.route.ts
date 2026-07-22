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
import { validate } from '../middlewares/validate.middleware';
import { AppError } from '../utils/AppError';

const router = Router();

// GET /api/example/ - Ambil semua data (dengan pagination, search, filter, sort)
router.get('/', validate(GetAllExampleSchema), getAllExamples);

// POST /api/example/ - Buat data baru (single)
router.post('/', validate(CreateExampleSchema), createExample);

// POST /api/example/bulk - Bulk create (array body)
router.post('/bulk', validate(BulkCreateExampleSchema), bulkCreateExamples);

// POST /api/example/with-items - Buat data dengan nested items
router.post('/with-items', validate(CreateExampleWithItemsSchema), createExampleWithItems);

// GET /api/example/:id - Ambil data by ID
router.get('/:id', validate(GetExampleByIdSchema), getExampleById);

// PUT /api/example/:id - Full update
router.put('/:id', validate(UpdateExampleSchema), updateExample);

// PATCH /api/example/:id - Partial update
router.patch('/:id', validate(PartialUpdateExampleSchema), partialUpdateExample);

// DELETE /api/example/:id - Hapus data
router.delete('/:id', validate(DeleteExampleSchema), deleteExample);

// Contoh kalau salah method di path mana pun
router.all('/*path', (req, res, next) => {
  next(new AppError(`Method ${req.method} tidak diizinkan di endpoint ini`, 405));
});

export default router;
