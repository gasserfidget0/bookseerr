'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { BookList } from '@/components/books/BookList';
import { AddBookForm } from '@/components/books/AddBookForm';
import { SearchResultList } from '@/components/books/SearchResultList';
import { BookDetailsModal } from '@/components/books/BookDetailsModal';
import { toast } from '@/components/ui/toast';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleSelectBook = async (book: any) => {
    setIsFetchingDetails(true);
    toast.info('Fetching book details...');
    try {
      // --- THE FIX ---
      // Send the 'foreignBookId' from the search result as the query parameter.
      const response = await fetch(`/api/get-book-details?foreignBookId=${book.foreignBookId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get details');
      }
      
      const result = await response.json();
      setSelectedBook(result.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  if (!user) {
    return null;
  }

  return (
    <div>
      <AddBookForm onSearchResults={setSearchResults} />
      <SearchResultList results={searchResults} onSelectBook={handleSelectBook} />
      <BookList />
      {selectedBook && (
        <BookDetailsModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
      {isFetchingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <p className="text-white">Loading Details...</p>
        </div>
      )}
    </div>
  );
}
