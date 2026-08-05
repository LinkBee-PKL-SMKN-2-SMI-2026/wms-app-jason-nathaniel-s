import z from 'zod';

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama kategori minimal 3 karakter'),
    description: z.string().optional(),
  }),
});

export const GetAllCategorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    sort: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export const GetCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export const UpdateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3, 'Nama kategori minimal 3 karakter'),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const DeleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});