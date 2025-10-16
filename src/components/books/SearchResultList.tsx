'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';

const addBook = async (bookData: { title: string; author: string; foreign_book_id: string; image_url?: string }) => {
  const response = await fetch('/api/books', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add book');
  }
  return response.json();
};

interface SearchResultListProps {
  results: any[];
}

export function SearchResultList({ results }: SearchResultListProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: (data) => {
      toast.success(`"${data.data.title}" was added to your library!`);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddBook = (book: any) => {
    // --- THE FIX ---
    // Use the 'remoteCover' property which has the full URL
    const imageUrl = book.remoteCover;

    mutation.mutate({
      title: book.title,
      author: book.author?.authorName || 'Unknown Author',
      foreign_book_id: String(book.id),
      image_url: imageUrl,
    });
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((book) => (
          <div key={book.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">{book.title}</h3>
              <p className="text-sm text-gray-400">by {book.author?.authorName || 'Unknown Author'}</p>
            </div>
            <button
              onClick={() => handleAddBook(book)}
              disabled={mutation.isPending && mutation.variables?.foreign_book_id === String(book.id)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-green-400"
            >
              {mutation.isPending && mutation.variables?.foreign_book_id === String(book.id) ? 'Adding...' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
