'use client';

// This component is now much simpler. Its only job is to display results
// and tell the parent component which book was selected for more details.

interface SearchResultListProps {
  results: any[];
  onSelectBook: (book: any) => void; // New prop to handle selection
}

export function SearchResultList({ results, onSelectBook }: SearchResultListProps) {
  if (results.length === 0) {
    return null; // Don't render anything if there are no results
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((book) => (
          <div key={book.id || book.foreignBookId} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">{book.title}</h3>
              <p className="text-sm text-gray-400">by {book.author?.authorName || 'Unknown Author'}</p>
            </div>
            <button
              onClick={() => onSelectBook(book)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
