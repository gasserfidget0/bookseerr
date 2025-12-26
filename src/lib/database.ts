import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { DatabaseUser, DatabaseBook } from '@/types/api';

export type { DatabaseUser };

export interface DatabaseRequest {
  id: number;
  user_id: number;
  book_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  message?: string;
  created_at: string;
  updated_at: string;
  approved_by?: number;
  approved_at?: string;
}

const dbPath = path.join(process.cwd(), 'data', 'bookseerr.db');
const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'wanted',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_by INTEGER,
      approved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    );
  `);

  // --- MIGRATION LOGIC ---
  const booksColumns = db.pragma('table_info(books)') as { name: string }[];
  if (!booksColumns.some(col => col.name === 'foreign_book_id')) {
    console.log('Migration: Adding foreign_book_id column to books table...');
    db.exec('ALTER TABLE books ADD COLUMN foreign_book_id TEXT');
  }
  if (!booksColumns.some(col => col.name === 'image_url')) {
    console.log('Migration: Adding image_url column to books table...');
    db.exec('ALTER TABLE books ADD COLUMN image_url TEXT');
  }
  // --- END MIGRATION LOGIC ---

  // --- DEFAULT ADMIN USER CREATION ---
  const adminUser = getUserByUsername('admin');
  if (!adminUser) {
    console.log('Creating default admin user...');
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync('admin', salt);
    createUser({
      username: 'admin',
      email: 'admin@bookseerr.local',
      password_hash: passwordHash,
      role: 'admin',
      avatar: null,
      permissions: null
    });
  }
  // --- END DEFAULT ADMIN USER CREATION ---

  console.log('Database initialized');
}

// User Functions
export function getUserById(id: number | string): DatabaseUser | null {
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return (stmt.get(userId) as DatabaseUser | undefined) || null;
}
export function getUserByUsername(username: string): DatabaseUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return (stmt.get(username) as DatabaseUser | undefined) || null;
}
export function getUserByEmail(email: string): DatabaseUser | null {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return (stmt.get(email) as DatabaseUser | undefined) || null;
}
export function createUser(user: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): DatabaseUser {
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, avatar, permissions)
    VALUES (@username, @email, @password_hash, @role, @avatar, @permissions)
  `);
  const result = stmt.run({ ...user, avatar: user.avatar || null, permissions: user.permissions || null });
  return getUserById(result.lastInsertRowid as number)!;
}

export function getAllUsers(): DatabaseUser[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as DatabaseUser[];
}

export function updateUser(id: number, updates: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>): DatabaseUser {
  const user = getUserById(id);
  if (!user) throw new Error('User not found');
  
  const updates_safe = {
    username: updates.username || user.username,
    email: updates.email || user.email,
    password_hash: updates.password_hash || user.password_hash,
    role: updates.role || user.role,
    avatar: updates.avatar !== undefined ? updates.avatar : user.avatar,
    permissions: updates.permissions !== undefined ? updates.permissions : user.permissions,
  };

  const stmt = db.prepare(`
    UPDATE users 
    SET username = @username, email = @email, password_hash = @password_hash, 
        role = @role, avatar = @avatar, permissions = @permissions, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run({ ...updates_safe, id });
  return getUserById(id)!;
}

export function deleteUser(id: number): void {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(id);
}

// Book Functions
export function getBookById(id: number): DatabaseBook | null {
  const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
  return (stmt.get(id) as DatabaseBook | undefined) || null;
}
export function getBookByForeignId(foreignId: string): DatabaseBook | null {
  const stmt = db.prepare('SELECT * FROM books WHERE foreign_book_id = ?');
  return (stmt.get(foreignId) as DatabaseBook | undefined) || null;
}
export function getAllBooks(): DatabaseBook[] {
  const stmt = db.prepare('SELECT * FROM books ORDER BY created_at DESC');
  return stmt.all() as DatabaseBook[];
}
export function createBook(book: { title: string; author: string; status: string; foreign_book_id?: string; image_url?: string }): DatabaseBook {
  const stmt = db.prepare(`INSERT INTO books (title, author, status, foreign_book_id, image_url) VALUES (@title, @author, @status, @foreign_book_id, @image_url)`);
  const result = stmt.run(book);
  return getBookById(result.lastInsertRowid as number)!;
}
export function deleteBook(id: number): void {
  const stmt = db.prepare('DELETE FROM books WHERE id = ?');
  stmt.run(id);
}
export function updateBookStatus(id: number, status: DatabaseBook['status']): DatabaseBook {
  const stmt = db.prepare('UPDATE books SET status = ? WHERE id = ?');
  stmt.run(status, id);
  return getBookById(id)!;
}

// Request Functions
export function createRequest(userId: number, bookId: number, message?: string): DatabaseRequest {
  const stmt = db.prepare(`
    INSERT INTO requests (user_id, book_id, status, message)
    VALUES (@user_id, @book_id, @status, @message)
  `);
  const result = stmt.run({ user_id: userId, book_id: bookId, status: 'pending', message: message || null });
  return getRequestById(result.lastInsertRowid as number)!;
}

export function getRequestById(id: number): DatabaseRequest | null {
  const stmt = db.prepare('SELECT * FROM requests WHERE id = ?');
  return (stmt.get(id) as DatabaseRequest | undefined) || null;
}

export function getRequestsByUserId(userId: number): DatabaseRequest[] {
  const stmt = db.prepare('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as DatabaseRequest[];
}

export function getAllRequests(): DatabaseRequest[] {
  const stmt = db.prepare(`
    SELECT r.*, u.username, b.title, b.author 
    FROM requests r 
    LEFT JOIN users u ON r.user_id = u.id 
    LEFT JOIN books b ON r.book_id = b.id 
    ORDER BY r.created_at DESC
  `);
  return stmt.all() as any[];
}

export function getRequestsByStatus(status: string): DatabaseRequest[] {
  const stmt = db.prepare('SELECT * FROM requests WHERE status = ? ORDER BY created_at DESC');
  return stmt.all(status) as DatabaseRequest[];
}

export function updateRequestStatus(id: number, status: DatabaseRequest['status'], approvedBy?: number): DatabaseRequest {
  const request = getRequestById(id);
  if (!request) throw new Error('Request not found');

  if (status === 'approved' || status === 'rejected') {
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = @status, approved_by = @approved_by, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run({ status, approved_by: approvedBy || null, id });
  } else {
    const stmt = db.prepare('UPDATE requests SET status = @status, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run({ status, id });
  }

  return getRequestById(id)!;
}

export function deleteRequest(id: number): void {
  const stmt = db.prepare('DELETE FROM requests WHERE id = ?');
  stmt.run(id);
}

initializeDatabase();
export default db;
