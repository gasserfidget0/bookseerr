const apiUrl = process.env.READARR_URL
const apiKey = process.env.READARR_API_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing READARR_URL or READARR_API_KEY from .env file')
}

// This function gets your existing library
export async function getReadarrBooks() {
  const res = await fetch(`${apiUrl}/book`, {
    headers: {
      'X-Api-Key': apiKey!,
    },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch books from Readarr')
  }
  return res.json()
}

// This new function searches for new books
export async function searchReadarrBooks(query: string) {
  const res = await fetch(`${apiUrl}/book/lookup?term=${encodeURIComponent(query)}`, {
    headers: {
      'X-Api-Key': apiKey!,
    },
  })
  if (!res.ok) {
    throw new Error('Failed to search for books in Readarr')
  }
  return res.json()
}
