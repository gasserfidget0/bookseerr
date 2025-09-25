'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';

// This function will POST the new book data to our API
const addBook = async (bookData: { title: string; author: string }) => {
  const response = await fetch('/api/books', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookData),
  });
  if (!response.ok) {
    throw new Error('Failed to add book');
  }
  return response.json();
};

export function AddBookForm() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const queryClient = useQueryClient();

  // useMutation handles the state for POST/PUT/DELETE operations
  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      toast.success('Book added!');
      // This tells React Query to refetch the 'books' query, updating our list
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setTitle('');
      setAuthor('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      toast.error('Title and Author are required');
      return;
    }
    mutation.mutate({ title, author });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Add a New Book</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book Title"
          className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {mutation.isPending ? 'Adding...' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}
