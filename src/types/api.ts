export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string | null;
  role: string;
  avatar?: string | null;
  permissions?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DatabaseBook {
  id: number;
  title: string;
  author: string;
  status: 'wanted' | 'reading' | 'read' | 'skipped';
  created_at: string;
  updated_at?: string;
}

export interface DatabaseRequest {
  id: number;
  book_id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at?: string;
}

export interface DatabaseSettings {
  key: string;
  value: string;
}
