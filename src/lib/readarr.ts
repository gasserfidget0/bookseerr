const apiUrl = process.env.READARR_URL
const apiKey = process.env.READARR_API_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing READARR_URL or READARR_API_KEY from .env file')
}

export async function getReadarrBooks() {
  const res = await fetch(`${apiUrl}/book`, {
    headers: { 'X-Api-Key': apiKey! },
  })
  if (!res.ok) { throw new Error('Failed to fetch books from Readarr') }
  return res.json()
}

export async function searchReadarrBooks(query: string) {
  const res = await fetch(`${apiUrl}/book/lookup?term=${encodeURIComponent(query)}`, {
    headers: { 'X-Api-Key': apiKey! },
  })
  if (!res.ok) { throw new Error('Failed to search for books in Readarr') }
  return res.json()
}

export async function addBookToReadarr(book: any) {
  // Safety check for the author object, which can be null
  if (!book.author || typeof book.author.id === 'undefined') {
    throw new Error("Cannot add this book: Author information is missing from Readarr's search result.");
  }

  // --- THE FINAL FIX: Manually construct the payload to match the successful request ---
  const readarrPayload = {
    title: book.title,
    authorId: book.author.id, // Use the nested ID as the top-level property
    foreignBookId: book.foreignBookId,
    foreignEditionId: book.foreignEditionId, // Include this for completeness
    monitored: true,
    anyEditionOk: true,
    qualityProfileId: 2,
    rootFolderPath: "/audiobooks",
    addOptions: {
      searchForNewBook: true,
    },
  };

  const res = await fetch(`${apiUrl}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey!,
    },
    body: JSON.stringify(readarrPayload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Readarr API Error:", errorText);
    throw new Error(`Readarr Error: ${errorText}`);
  }
  return res.json();
}
