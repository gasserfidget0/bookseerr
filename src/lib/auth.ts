import jwt from 'jsonwebtoken';
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
