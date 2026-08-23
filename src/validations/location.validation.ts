import z from 'zod';

export const CreateLocationSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama lokasi minimal 3 karakter'),
    code: z
      .string()
      .max(10, 'Kode lokasi maksimal 10 karakter')
      .regex(/^[A-Z0-9_-]+$/, 'Kode lokasi hanya boleh huruf besar, angka, titik, atau strip'),
  }),
});

export const GetAllLocationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    sort: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export const GetLocationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});

export const UpdateLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3, 'Nama lokasi minimal 3 karakter'),
    code: z
      .string()
      .max(10, 'Kode lokasi maksimal 10 karakter')
      .regex(/^[A-Z0-9_-]+$/, 'Kode lokasi hanya boleh huruf besar, angka, titik, atau strip'),
    isActive: z.boolean().optional(),
  }),
});

export const DeleteLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID tidak valid'),
  }),
});
