import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { getRequestById, updateRequestStatus, deleteRequest } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;
  const requestId = typeof id === 'string' ? parseInt(id, 10) : null;

  if (!requestId) {
    return res.status(400).json({ error: 'Invalid request ID' });
  }

  try {
    if (req.method === 'GET') {
      const request = getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Users can only see their own requests
      if (user.role !== 'admin' && request.user_id !== user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      return res.status(200).json({ success: true, data: request });
    }

    if (req.method === 'PUT') {
      // Only admins can approve/reject requests
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can manage requests' });
      }

      const { status } = req.body;
      if (!['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const request = getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const updatedRequest = updateRequestStatus(requestId, status as any, user.id);
      return res.status(200).json({ success: true, data: updatedRequest });
    }

    if (req.method === 'DELETE') {
      const request = getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Users can delete their own requests, admins can delete any
      if (user.role !== 'admin' && request.user_id !== user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      deleteRequest(requestId);
      return res.status(200).json({ success: true, message: 'Request deleted' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('Request error:', err);
    return res.status(500).json({ error: err.message });
  }
}
