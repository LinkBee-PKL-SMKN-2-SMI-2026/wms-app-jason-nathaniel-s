import z from 'zod';

export const GetSummarySchema = z.object({
  query: z.object({
    date: z.string().optional(),
  }),
});

export const GetLowStockSchema = z.object({
  query: z.object({
    threshold: z.coerce.number().int().positive().default(10),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});