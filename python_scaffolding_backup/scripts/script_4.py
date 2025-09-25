# Create database and utility functions
def create_lib_files():
    
    # src/lib/database.ts - Database utilities
    database_lib = '''import Database from 'better-sqlite3';
import path from 'path';
import { DatabaseBook, DatabaseUser, DatabaseRequest, DatabaseSettings } from '@/types/api';

const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || path.join(process.cwd(), 'bookseerr.db');
const db = new Database(dbPath);

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      avatar TEXT,
      permissions TEXT
    )
  `);

  // Books table
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      published_date TEXT,
      description TEXT,
      page_count INTEGER,
      categories TEXT,
      image_url TEXT,
      available BOOLEAN DEFAULT FALSE,
      google_books_id TEXT,
      goodreads_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
      requested_at TEXT DEFAULT (datetime('now')),
      approved_at TEXT,
      rejected_at TEXT,
      completed_at TEXT,
      notes TEXT,
      rejection_reason TEXT,
      approved_by TEXT,
      FOREIGN KEY (book_id) REFERENCES books (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (approved_by) REFERENCES users (id)
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create default admin user if not exists
  const adminUser = getUserByUsername('admin');
  if (!adminUser) {
    createDefaultAdmin();
  }
}

// User functions
export function getUserByUsername(username: string): DatabaseUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as DatabaseUser | null;
}

export function getUserByEmail(email: string): DatabaseUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as DatabaseUser | null;
}

export function getUserById(id: string): DatabaseUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as DatabaseUser | null;
}

export function createUser(user: Omit<DatabaseUser, 'created_at' | 'updated_at'>): DatabaseUser {
  const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, avatar, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    user.id,
    user.username,
    user.email,
    user.password_hash,
    user.role,
    user.avatar || null,
    user.permissions || null
  );
  
  return getUserById(user.id)!;
}

export function updateUser(id: string, updates: Partial<DatabaseUser>): DatabaseUser | null {
  const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`);
  if (fields.length === 0) return getUserById(id);
  
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([, value]) => value);
  
  values.push(new Date().toISOString(), id);
  
  const stmt = db.prepare(`
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = ?
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getUserById(id);
}

export function getAllUsers(): DatabaseUser[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as DatabaseUser[];
}

// Book functions
export function getBookById(id: string): DatabaseBook | null {
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  return stmt.get(id) as DatabaseBook | null;
}

export function searchBooks(params: {
  query?: string;
  author?: string;
  category?: string;
  available?: boolean;
  limit?: number;
  offset?: number;
}): { books: DatabaseBook[]; total: number } {
  let whereConditions = [];
  let queryParams = [];

  if (params.query) {
    whereConditions.push('(title LIKE ? OR author LIKE ? OR description LIKE ?)');
    queryParams.push(`%${params.query}%`, `%${params.query}%`, `%${params.query}%`);
  }

  if (params.author) {
    whereConditions.push('author LIKE ?');
    queryParams.push(`%${params.author}%`);
  }

  if (params.category) {
    whereConditions.push('categories LIKE ?');
    queryParams.push(`%${params.category}%`);
  }

  if (params.available !== undefined) {
    whereConditions.push('available = ?');
    queryParams.push(params.available);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Get total count
  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM books ${whereClause}`);
  const { count: total } = countStmt.get(...queryParams) as { count: number };

  // Get books with pagination
  const limit = params.limit || 20;
  const offset = params.offset || 0;
  
  const booksStmt = db.prepare(`
    SELECT * FROM books 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `);
  
  const books = booksStmt.all(...queryParams, limit, offset) as DatabaseBook[];

  return { books, total };
}

export function createBook(book: Omit<DatabaseBook, 'created_at' | 'updated_at'>): DatabaseBook {
  const stmt = db.prepare(`
    INSERT INTO books (
      id, title, author, isbn, published_date, description, 
      page_count, categories, image_url, available, 
      google_books_id, goodreads_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    book.id,
    book.title,
    book.author,
    book.isbn || null,
    book.published_date || null,
    book.description || null,
    book.page_count || null,
    book.categories || null,
    book.image_url || null,
    book.available,
    book.google_books_id || null,
    book.goodreads_id || null
  );
  
  return getBookById(book.id)!;
}

export function updateBook(id: string, updates: Partial<DatabaseBook>): DatabaseBook | null {
  const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`);
  if (fields.length === 0) return getBookById(id);
  
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([, value]) => value);
  
  values.push(new Date().toISOString(), id);
  
  const stmt = db.prepare(`
    UPDATE books 
    SET ${fields.join(', ')}, updated_at = ?
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getBookById(id);
}

// Request functions
export function getRequestById(id: string): DatabaseRequest | null {
  const stmt = db.prepare('SELECT * FROM requests WHERE id = ?');
  return stmt.get(id) as DatabaseRequest | null;
}

export function getRequestsByUserId(userId: string): DatabaseRequest[] {
  const stmt = db.prepare('SELECT * FROM requests WHERE user_id = ? ORDER BY requested_at DESC');
  return stmt.all(userId) as DatabaseRequest[];
}

export function getRequestsByStatus(status: string): DatabaseRequest[] {
  const stmt = db.prepare('SELECT * FROM requests WHERE status = ? ORDER BY requested_at DESC');
  return stmt.all(status) as DatabaseRequest[];
}

export function getAllRequests(): DatabaseRequest[] {
  const stmt = db.prepare('SELECT * FROM requests ORDER BY requested_at DESC');
  return stmt.all() as DatabaseRequest[];
}

export function createRequest(request: Omit<DatabaseRequest, 'requested_at'>): DatabaseRequest {
  const stmt = db.prepare(`
    INSERT INTO requests (
      id, book_id, user_id, status, notes
    )
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    request.id,
    request.book_id,
    request.user_id,
    request.status,
    request.notes || null
  );
  
  return getRequestById(request.id)!;
}

export function updateRequest(id: string, updates: Partial<DatabaseRequest>): DatabaseRequest | null {
  const fields = Object.keys(updates).filter(key => key !== 'id').map(key => `${key} = ?`);
  if (fields.length === 0) return getRequestById(id);
  
  const values = Object.entries(updates)
    .filter(([key]) => key !== 'id')
    .map(([, value]) => value);
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE requests 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getRequestById(id);
}

// Settings functions
export function getSetting(key: string): string | null {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result ? result.value : null;
}

export function setSetting(key: string, value: string): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (id, key, value, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(
    `setting_${key}`,
    key,
    value,
    new Date().toISOString()
  );
}

// Helper function to create default admin user
function createDefaultAdmin() {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  const adminId = uuidv4();
  const passwordHash = bcrypt.hashSync('admin', 10);
  
  createUser({
    id: adminId,
    username: 'admin',
    email: 'admin@bookseerr.local',
    password_hash: passwordHash,
    role: 'admin',
    permissions: JSON.stringify({
      canRequest: true,
      canApprove: true,
      canManageUsers: true,
      canConfigureSettings: true
    })
  });
  
  console.log('Created default admin user (username: admin, password: admin)');
}

// Initialize database on import
initializeDatabase();

export { db };
'''
    
    # src/lib/auth.ts - Authentication utilities
    auth_lib = '''import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthTokenPayload, DatabaseUser } from '@/types/api';
import { User } from '@/types';
import { getUserById } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600'; // 1 hour

export function generateToken(user: DatabaseUser): string {
  const payload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN + 's'
  });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function databaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    avatar: dbUser.avatar || undefined,
    permissions: dbUser.permissions ? JSON.parse(dbUser.permissions) : undefined
  };
}

export function extractTokenFromRequest(req: NextApiRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookieToken = req.cookies['auth-token'];
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

export function authenticateRequest(req: NextApiRequest): User | null {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  const dbUser = getUserById(payload.userId);
  if (!dbUser) return null;
  
  return databaseUserToUser(dbUser);
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = authenticateRequest(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    return handler(req, res, user);
  };
}

export function requireRole(role: 'admin' | 'user', handler: (req: NextApiRequest, res: NextApiResponse, user: User) => Promise<void>) {
  return requireAuth(async (req, res, user) => {
    if (user.role !== 'admin' && user.role !== role) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    return handler(req, res, user);
  });
}

export function setAuthCookie(res: NextApiResponse, token: string): void {
  const maxAge = parseInt(JWT_EXPIRES_IN) * 1000; // Convert to milliseconds
  
  res.setHeader('Set-Cookie', [
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  ]);
}

export function clearAuthCookie(res: NextApiResponse): void {
  res.setHeader('Set-Cookie', [
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  ]);
}
'''
    
    # src/lib/utils.ts - General utilities
    utils_lib = '''import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwindcss-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateObj);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
  // Password should be at least 6 characters
  return password.length >= 6;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
) {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    ...(message && { message })
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'approved':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'completed':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'approved':
      return '✅';
    case 'rejected':
      return '❌';
    case 'completed':
      return '🎉';
    case 'failed':
      return '💥';
    default:
      return '❓';
  }
}
'''
    
    # Write library files
    with open("bookseerr/src/lib/database.ts", "w") as f:
        f.write(database_lib)
    
    with open("bookseerr/src/lib/auth.ts", "w") as f:
        f.write(auth_lib)
    
    with open("bookseerr/src/lib/utils.ts", "w") as f:
        f.write(utils_lib)
    
    return "Library files created"

print(create_lib_files())