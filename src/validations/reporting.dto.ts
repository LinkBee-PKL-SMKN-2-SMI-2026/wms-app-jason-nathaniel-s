export interface SummaryResponse {
  totalProducts: number;
  totalCategories: number;
  totalLocations: number;
  totalStockInboundToday: number;
  totalStockOutboundToday: number;
  totalUsers: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minimumStock: number;
  categoryName: string;
  locationName: string;
}

export interface GetSummaryQuery {
  date?: string;
}

export interface GetLowStockQuery {
  threshold: number;
  page: number;
  limit: number;
}