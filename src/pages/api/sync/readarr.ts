import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import { getReadarrBooks } from '@/lib/readarr';
import { createBook, getBookByForeignId, updateBookStatus } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await authenticateUser(req, res);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Only admins can sync
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Starting Readarr library sync...');
    const readarrBooks = await getReadarrBooks();
    
    if (!Array.isArray(readarrBooks)) {
      return res.status(500).json({ error: 'Invalid Readarr response' });
    }

    let syncedCount = 0;
    let updatedCount = 0;

    for (const book of readarrBooks) {
      const foreignBookId = book.foreignBookId || book.id?.toString();
      
      if (!foreignBookId) {
        console.warn('Book has no ID:', book);
        continue;
      }

      const existing = getBookByForeignId(foreignBookId);
      
      if (existing) {
        // Update status based on Readarr state
        const newStatus = book.grabbed ? 'downloading' : (book.monitored ? 'wanted' : 'unmonitored');
        updateBookStatus(existing.id, newStatus);
        updatedCount++;
      } else {
        // Create new book entry
        createBook({
          title: book.title || 'Unknown',
          author: book.authorName || book.author?.authorName || 'Unknown Author',
          status: book.grabbed ? 'downloading' : 'wanted',
          foreign_book_id: foreignBookId,
          image_url: book.remoteCover || null,
        });
        syncedCount++;
      }
    }

    console.log(`Sync complete: ${syncedCount} new books, ${updatedCount} updated`);

    return res.status(200).json({
      success: true,
      message: 'Library synced successfully',
      stats: {
        totalBooks: readarrBooks.length,
        newBooksAdded: syncedCount,
        booksUpdated: updatedCount,
      },
    });
  } catch (err: any) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
