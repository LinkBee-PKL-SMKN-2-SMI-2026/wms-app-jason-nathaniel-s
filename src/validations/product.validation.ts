import z from 'zod';

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama produk minimal 3 karakter'),
    sku: z.string().min(1, 'SKU wajib diisi'),
    description: z.string().optional(),
    stock: z.number().int().min(0, 'Stock tidak boleh negatif').default(0),
    minimumStock: z.number().int().min(0).default(10),
    categoryId: z.string().uuid('Category ID tidak valid'),
    locationId: z.string().uuid('Location ID tidak valid'),
  }),
});

export const GetAllProductSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    sort: z.enum(['asc', 'desc']).default('asc'),
    categoryId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
  }),
});

export const GetProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export const UpdateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3, 'Nama produk minimal 3 karakter'),
    sku: z.string().min(1, 'SKU wajib diisi'),
    description: z.string().optional(),
    minimumStock: z.number().int().min(0),
    categoryId: z.string().uuid('Category ID tidak valid'),
    locationId: z.string().uuid('Location ID tidak valid'),
  }),
});

export const DeleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});
