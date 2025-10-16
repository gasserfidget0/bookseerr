import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { searchReadarrBooks } from '@/lib/readarr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { query } = req.query;

  if (typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: 'A search query is required.' });
  }

  try {
    const searchResults = await searchReadarrBooks(query);
    return res.status(200).json({ success: true, data: searchResults });
  } catch (err: any) {
    console.error('[Readarr Search Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
