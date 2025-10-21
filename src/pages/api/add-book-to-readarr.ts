import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { addBookToReadarr } from '@/lib/readarr';
import { createBook, getBookByForeignId } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const bookFromSearch = req.body;

    const existingBook = getBookByForeignId(String(bookFromSearch.id));
    if (existingBook) {
      return res.status(409).json({ success: false, error: 'This book is already in your library.' });
    }

    // --- THE FIX ---
    // Step 1: Tell Readarr to add the book using the robust foreignBookId method.
    await addBookToReadarr(bookFromSearch);

    // Step 2: If that succeeds, save the book to our local database,
    // making sure to use the author's name from the search result for our UI.
    const newLocalBook = createBook({
      title: bookFromSearch.title,
      author: bookFromSearch.author?.authorName || 'Unknown Author', // Use the author name for our UI
      status: 'wanted',
      foreign_book_id: String(bookFromSearch.id),
      image_url: bookFromSearch.remoteCover || null,
    });

    return res.status(201).json({ success: true, data: newLocalBook });

  } catch (err: any) {
    console.error('[Add Book to Readarr Error]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
