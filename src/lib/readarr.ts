const apiUrl = process.env.READARR_URL
const apiKey = process.env.READARR_API_KEY

if (!apiUrl || !apiKey) {
  throw new Error('Missing READARR_URL or READARR_API_KEY from .env file')
}

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
