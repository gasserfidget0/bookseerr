import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { getAllUsers, updateUser, deleteUser, getUserById } from '@/lib/database';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    if (req.method === 'GET') {
      const users = getAllUsers().map(u => ({
        ...u,
        password_hash: undefined, // Don't expose password hashes
      }));
      return res.status(200).json({ success: true, data: users });
    }

    if (req.method === 'POST') {
      const { userId, role, email, username } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const existingUser = getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updates: any = {};
      if (role && ['admin', 'user'].includes(role)) updates.role = role;
      if (email) updates.email = email;
      if (username) updates.username = username;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      const updatedUser = updateUser(userId, updates);
      const { password_hash, ...safeUser } = updatedUser;
      return res.status(200).json({ success: true, data: safeUser });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: err.message });
  }
}
