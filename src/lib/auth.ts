import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, DatabaseUser } from './database';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  password_hash: string;
  avatar?: string | null;
  permissions?: string | null;
  created_at: string;
  updated_at?: string;
}

interface AuthTokenPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600';

export function generateToken(user: User | DatabaseUser): string {
  const payload: AuthTokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role as 'admin' | 'user',
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: parseInt(JWT_EXPIRES_IN, 10),
  });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(req: NextApiRequest, res: NextApiResponse): Promise<User | null> {
  const token = req.cookies.token;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const userFromDb = getUserById(payload.userId);
    if (!userFromDb) return null;
    
    return userFromDb as User;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
