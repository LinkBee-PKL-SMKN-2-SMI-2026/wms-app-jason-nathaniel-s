import z from 'zod';

// ===========================
// Create Single
// ===========================

export const CreateExampleSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
    description: z.string().optional(),
    isActive: z.coerce.boolean().default(true),
  }),
});

// ===========================
// Get All (Query Params: Pagination, Search, Filter, Sort)
// ===========================

export const GetAllExampleSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    sort: z.enum(['asc', 'desc']).default('asc'),
    isActive: z.coerce.boolean().optional(),
  }),
});

// ===========================
// Get By ID (Params)
// ===========================

export const GetExampleByIdSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'ID harus berupa UUID yang valid' }),
  }),
});

// ===========================
// Update Full (PUT)
// ===========================

export const UpdateExampleSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'ID harus berupa UUID yang valid' }),
  }),
  body: z.object({
    name: z.string({ error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
    description: z.string().optional(),
    isActive: z.coerce.boolean(),
  }),
});

// ===========================
// Partial Update (PATCH)
// ===========================

export const PartialUpdateExampleSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'ID harus berupa UUID yang valid' }),
  }),
  body: z
    .object({
      name: z.string().min(3, 'Nama minimal 3 karakter').optional(),
      description: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      error: 'Minimal satu field harus diisi',
    }),
});

// ===========================
// Delete By ID (Params)
// ===========================

export const DeleteExampleSchema = z.object({
  params: z.object({
    id: z.uuid({ error: 'ID harus berupa UUID yang valid' }),
  }),
});

// ===========================
// Bulk Create (Array Body)
// ===========================

export const BulkCreateExampleSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          name: z.string({ error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
          description: z.string().optional(),
          isActive: z.coerce.boolean().default(true),
        }),
        { error: 'Items harus berupa array' },
      )
      .min(1, 'Minimal 1 item')
      .max(50, 'Maksimal 50 item per request'),
  }),
});

// ===========================
// Create With Nested Items
// ===========================

export const CreateExampleWithItemsSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Nama wajib diisi' }).min(3, 'Nama minimal 3 karakter'),
    category: z.string({ error: 'Kategori wajib diisi' }).min(1, 'Kategori tidak boleh kosong'),
    items: z
      .array(
        z.object({
          productName: z
            .string({ error: 'Nama product wajib diisi' })
            .min(1, 'Nama product tidak boleh kosong'),
          quantity: z.coerce.number().int().positive({ error: 'Quantity harus lebih dari 0' }),
          price: z.coerce.number().positive({ error: 'Harga harus lebih dari 0' }),
        }),
        { error: 'Items harus berupa array' },
      )
      .min(1, 'Minimal 1 item')
      .max(20, 'Maksimal 20 item'),
  }),
});
