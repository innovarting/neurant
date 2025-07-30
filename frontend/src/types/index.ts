// Export all type definitions for NeurAnt
export * from './auth';
export * from './chatbot';
export * from './conversation';
export * from './analytics';

// Global types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
