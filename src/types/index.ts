export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  filePath?: string;
  status: 'wanted' | 'downloaded' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface BookRequest {
  id: number;
  userId: number;
  bookTitle: string;
  bookAuthor: string;
  isbn?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
}

export interface Settings {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
