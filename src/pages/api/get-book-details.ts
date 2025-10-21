import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';

const READARR_URL = process.env.READARR_URL;
const READARR_API_KEY = process.env.READARR_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { foreignBookId } = req.query;

  if (!foreignBookId) {
    return res.status(400).json({ error: 'foreignBookId is required' });
  }

  try {
    // This is the new, more detailed API call to Readarr
    const response = await fetch(`${READARR_URL}/book/lookup/goodreads?goodreadsId=${foreignBookId}`, {
      headers: {
        'X-Api-Key': READARR_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch detailed book info from Readarr');
    }

    const bookDetails = await response.json();
    return res.status(200).json({ success: true, data: bookDetails });

  } catch (err: any) {
    console.error('[Get Book Details Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
