// ===========================
// Amplop Standar (Create, Update, Get By ID, Delete)
// ===========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ===========================
// Metadata Pagination
// ===========================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ===========================
// Amplop Khusus Pagination (Get All / List)
// ===========================

export interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}
