import { NextApiRequest } from 'next';
import { User } from './index';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

export interface AuthTokenPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export interface DatabaseBook {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  published_date?: string | null;
  description?: string | null;
  page_count?: number | null;
  categories?: string | null; // JSON string
  image_url?: string | null;
  available: boolean;
  google_books_id?: string | null;
  goodreads_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  avatar?: string | null;
  permissions?: string | null; // JSON string
}

export interface DatabaseRequest {
  id: string;
  book_id: string;
  user_id: string;
  status: string;
  requested_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  approved_by?: string | null;
}

export interface DatabaseSettings {
  id: string;
  key: string;
  value: string; // JSON string
  updated_at: string;
}
