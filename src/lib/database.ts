import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { DatabaseUser, DatabaseBook } from '@/types/api';

export type { DatabaseUser };

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
  `);

  // --- MIGRATION LOGIC ---
  const columns = db.pragma('table_info(books)') as { name: string }[];
  if (!columns.some(col => col.name === 'foreign_book_id')) {
    console.log('Migration: Adding foreign_book_id column to books table...');
    db.exec('ALTER TABLE books ADD COLUMN foreign_book_id TEXT');
  }
  // --- NEW MIGRATION FOR IMAGE URL ---
  if (!columns.some(col => col.name === 'image_url')) {
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
// Updated createBook to accept image_url
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

initializeDatabase();
export default db;
