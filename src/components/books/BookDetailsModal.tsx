'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import Image from 'next/image';

const addBookToLibrary = async (bookData: any) => {
  const response = await fetch('/api/add-book-to-readarr', {
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

interface BookDetailsModalProps {
  book: any;
  onClose: () => void;
}

export function BookDetailsModal({ book, onClose }: BookDetailsModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addBookToLibrary,
    onSuccess: (data) => {
      toast.success(`"${data.data.title}" was requested and added to your library!`);
      queryClient.invalidateQueries({ queryKey: ['books'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddClick = () => {
    // --- THE DEBUGGING STEP ---
    // Log the object we're about to send to the backend
    console.log("Data sent from modal to backend:", book);
    mutation.mutate(book);
  };

  if (!book) return null;

  const imageUrl = book.remoteCover || book.images?.find((img: any) => img.coverType === 'cover')?.url;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full text-white">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Book Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-40 h-60 bg-gray-700 rounded-md overflow-hidden">
            {imageUrl ? (
              <Image src={imageUrl} alt={`Cover for ${book.title}`} width={160} height={240} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold">{book.title}</h3>
            <p className="text-md text-gray-400 mb-4">by {book.author?.authorName || 'Unknown Author'}</p>
            <p className="text-sm text-gray-300 max-h-40 overflow-y-auto">{book.overview || 'No description available.'}</p>
          </div>
        </div>
        <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
          <button
            onClick={handleAddClick} // Use the new handler
            disabled={mutation.isPending}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 disabled:bg-green-400"
          >
            {mutation.isPending ? 'Adding...' : 'Add to Readarr'}
          </button>
        </div>
      </div>
    </div>
  );
}
