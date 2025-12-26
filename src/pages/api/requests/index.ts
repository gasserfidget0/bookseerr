import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { createRequest, getRequestsByUserId, getAllRequests } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    if (req.method === 'GET') {
      // Admins see all requests, users see only their own
      const requests = user.role === 'admin' 
        ? getAllRequests() 
        : getRequestsByUserId(user.id);
      return res.status(200).json({ success: true, data: requests });
    }

    if (req.method === 'POST') {
      const { bookId, message } = req.body;
      
      if (!bookId) {
        return res.status(400).json({ error: 'bookId is required' });
      }

      const request = createRequest(user.id, bookId, message);
      return res.status(201).json({ success: true, data: request });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('Request error:', err);
    return res.status(500).json({ error: err.message });
  }
}
