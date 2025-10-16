import type { NextApiRequest, NextApiResponse } from 'next';
import { getReadarrBooks } from '@/lib/readarr';
import { authenticateUser } from '@/lib/auth';
import { getBookByForeignId, createBook } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const readarrBooks = await getReadarrBooks();
    let newBooksAdded = 0;

    for (const book of readarrBooks) {
      if (!book || !book.id || !book.title) continue; // Skip invalid book entries

      const existingBook = getBookByForeignId(String(book.id));

      if (!existingBook) {
        createBook({
          title: book.title,
          // Safer way to access the author name
          author: book.author?.authorName || 'Unknown Author',
          status: 'wanted',
          foreign_book_id: String(book.id),
        });
        newBooksAdded++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Sync complete. Added ${newBooksAdded} new books.`
    });

  } catch (err: any) {
    console.error('[Readarr Sync Error]: Full error object:', JSON.stringify(err, null, 2));
    const errorMessage = err.cause?.code || err.message || 'An unknown fetch error occurred.';
    return res.status(500).json({ success: false, error: errorMessage });
  }
}
