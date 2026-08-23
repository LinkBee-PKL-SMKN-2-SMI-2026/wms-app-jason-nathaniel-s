import z from 'zod';

export const GetDashboardStatsSchema = z.object({
  query: z.object({
    period: z.enum(['today', 'week', 'month']).default('week'),
  }),
});

export const GetRecentMovementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});
