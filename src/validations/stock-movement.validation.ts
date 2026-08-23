import z from 'zod';

export const CreateInboundSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Product ID harus UUID valid'),
    quantity: z.number().int().positive('Quantity harus lebih dari 0'),
    notes: z.string().optional(),
  }),
});

export const CreateOutboundSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Product ID harus UUID valid'),
    quantity: z.number().int().positive('Quantity harus lebih dari 0'),
    notes: z.string().optional(),
  }),
});

export const GetMovementHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    productId: z.string().uuid().optional(),
    type: z.enum(['INBOUND', 'OUTBOUND']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
