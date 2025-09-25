import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { getAllBooks, createBook } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method === 'GET') {
    try {
      const books = getAllBooks();
      return res.status(200).json({ success: true, data: books });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, author } = req.body;
      if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
      }
      const newBook = createBook({ title, author, status: 'wanted' });
      return res.status(201).json({ success: true, data: newBook });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create book' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
