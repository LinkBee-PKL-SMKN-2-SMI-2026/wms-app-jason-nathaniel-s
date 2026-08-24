import z from 'zod';

export const GetActivityLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    userId: z.string().uuid().optional(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']).optional(),
    entity: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
