'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';

// This function will call our new search API
const searchBooks = async (query: string) => {
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search for books');
  }
  const result = await response.json();
  return result.data;
};

interface AddBookFormProps {
  onSearchResults: (results: any[]) => void;
}

export function AddBookForm({ onSearchResults }: AddBookFormProps) {
  const [query, setQuery] = useState('');

  const mutation = useMutation({
    mutationFn: searchBooks,
    onSuccess: (data) => {
      toast.success(`Found ${data.length} results.`);
      onSearchResults(data); // Pass results to the parent component
    },
    onError: (error) => {
      toast.error(error.message);
      onSearchResults([]); // Clear previous results on error
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a search term.');
      return;
    }
    mutation.mutate(query);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Search for a New Book</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Readarr for a book or author..."
          className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
          disabled={mutation.isPending}
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {mutation.isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
