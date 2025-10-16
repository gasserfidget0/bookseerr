'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DatabaseBook } from '@/types/api';
import { toast } from '@/components/ui/toast';
import Image from 'next/image'; // Import the Next.js Image component

interface BookCardProps {
  book: DatabaseBook & { image_url?: string }; // Update the type to include image_url
}

const deleteBookMutationFn = async (bookId: number) => {
  const response = await fetch(`/api/books/${bookId}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) throw new Error('Failed to delete book');
  return response.json();
};

const updateStatusMutationFn = async ({ bookId, status }: { bookId: number; status: DatabaseBook['status'] }) => {
  const response = await fetch(`/api/books/${bookId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
};

export function BookCard({ book }: BookCardProps) {
  const queryClient = useQueryClient();
  const statuses: DatabaseBook['status'][] = ['wanted', 'reading', 'read'];

  const deleteMutation = useMutation({
    mutationFn: deleteBookMutationFn,
    onSuccess: () => {
      toast.success('Book deleted!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateStatusMutationFn,
    onSuccess: () => {
      toast.success('Status updated!');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleStatusCycle = () => {
    const currentIndex = statuses.indexOf(book.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    updateStatusMutation.mutate({ bookId: book.id, status: nextStatus });
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-blue-500/20 text-blue-300';
      case 'read': return 'bg-green-500/20 text-green-300';
      case 'skipped': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4">
      {/* --- THE FIX: Display the book cover --- */}
      <div className="flex-shrink-0 w-16 h-24 bg-gray-700 rounded-md overflow-hidden">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={`Cover for ${book.title}`}
            width={64}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center">No Image</div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white">{book.title}</h3>
        <p className="text-sm text-gray-400">by {book.author}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(book.status)}`}>
          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
        </span>
        <button onClick={handleStatusCycle} disabled={updateStatusMutation.isPending} className="text-gray-400 hover:text-white" aria-label="Cycle status">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.224 4.152l.876-.328A4.5 4.5 0 0014.25 12H12a.75.75 0 010-1.5h3.75a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0v-1.424zM4.688 8.576a5.5 5.5 0 019.224-4.152l-.876.328A4.5 4.5 0 005.75 8H8a.75.75 0 010 1.5H4.25a.75.75 0 01-.75-.75V5.25a.75.75 0 011.5 0v1.424z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={() => deleteMutation.mutate(book.id)} disabled={deleteMutation.isPending} className="text-red-400 hover:text-red-300 disabled:opacity-50" aria-label="Delete book">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
