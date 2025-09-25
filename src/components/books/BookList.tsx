'use client';

import { useQuery } from '@tanstack/react-query';
import { BookCard } from './BookCard';
import type { DatabaseBook } from '@/types/api';

const fetchBooks = async () => {
  const response = await fetch('/api/books', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed with status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'API returned an error');
  }
  return data.data;
};

export function BookList() {
  const { data: books, isLoading, error } = useQuery<DatabaseBook[]>({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  if (isLoading) {
    return <div className="text-center p-6">Loading books...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-400">Error loading books: {error.message}</div>;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">My Books</h2>
      {books && books.length > 0 ? (
        <div className="space-y-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No books found yet. Add one to get started!</p>
      )}
    </div>
  );
}
