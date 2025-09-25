import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { deleteBook, updateBookStatus } from '@/lib/database';
import { DatabaseBook } from '@/types/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid book ID' });
  }
  const bookId = parseInt(id, 10);

  if (req.method === 'DELETE') {
    try {
      deleteBook(bookId);
      return res.status(200).json({ success: true, message: 'Book deleted' });
    } catch (error) {
      console.error('Failed to delete book:', error);
      return res.status(500).json({ error: 'Failed to delete book' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { status } = req.body;
      if (!status || !['wanted', 'reading', 'read', 'skipped'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided' });
      }
      const updatedBook = updateBookStatus(bookId, status as DatabaseBook['status']);
      return res.status(200).json({ success: true, data: updatedBook });
    } catch (error) {
      console.error('Failed to update book status:', error);
      return res.status(500).json({ error: 'Failed to update book status' });
    }
  }

  res.setHeader('Allow', ['DELETE', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
