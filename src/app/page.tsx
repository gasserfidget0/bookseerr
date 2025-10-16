'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { BookList } from '@/components/books/BookList';
import { AddBookForm } from '@/components/books/AddBookForm';
import { SearchResultList } from '@/components/books/SearchResultList'; // Import the new component

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to hold search results

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* The form will update the searchResults state via this function */}
      <AddBookForm onSearchResults={setSearchResults} />

      {/* The new component to display the results */}
      <SearchResultList results={searchResults} />

      {/* The existing list of books already in your library */}
      <BookList />
    </div>
  );
}
