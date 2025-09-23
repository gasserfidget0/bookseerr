import Database from 'better-sqlite3';
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
