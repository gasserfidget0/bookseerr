'use client';

import { useQuery } from '@tanstack/react-query';

// This function will fetch our data
const fetchBooks = async () => {
  const response = await fetch('/api/books', {
    method: 'GET',
    credentials: 'include', // <-- THIS IS THE FIX: It sends the auth cookie
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    // We'll make the error more specific
    throw new Error(`Failed with status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'API returned an error');
  }
  return data.data;
};

export function BookList() {
  const { data: books, isLoading, error } = useQuery({
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
        <ul>
          {books.map((book: any) => (
            <li key={book.id}>{book.title}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No books found yet. Add one to get started!</p>
      )}
    </div>
  );
}
