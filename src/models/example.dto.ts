import { z } from 'zod';
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
import type { Example, ExampleItem } from '../../src/generated/prisma/client';

// ===========================
// Request Types (inferred dari Zod)
// ===========================

export type CreateExampleRequest = z.infer<typeof CreateExampleSchema>['body'];

export type GetAllExampleQuery = z.infer<typeof GetAllExampleSchema>['query'];

export type GetExampleByIdParams = z.infer<typeof GetExampleByIdSchema>['params'];

export type UpdateExampleRequest = z.infer<typeof UpdateExampleSchema>['body'];
export type UpdateExampleParams = z.infer<typeof UpdateExampleSchema>['params'];

export type PartialUpdateExampleRequest = z.infer<typeof PartialUpdateExampleSchema>['body'];
export type PartialUpdateExampleParams = z.infer<typeof PartialUpdateExampleSchema>['params'];

export type DeleteExampleParams = z.infer<typeof DeleteExampleSchema>['params'];

export type BulkCreateExampleRequest = z.infer<typeof BulkCreateExampleSchema>['body'];

export type CreateExampleWithItemsRequest = z.infer<typeof CreateExampleWithItemsSchema>['body'];

// ===========================
// Data Response Types (tanpa wrapper)
// ===========================

export interface ExampleWithItemsData {
  id: string;
  name: string;
  category: string;
  items: ExampleItem[];
  totalItems: number;
  totalValue: number;
}

export interface BulkCreateResult {
  created: Example[];
  failed: Array<{ index: number; name: string; reason: string }>;
}
