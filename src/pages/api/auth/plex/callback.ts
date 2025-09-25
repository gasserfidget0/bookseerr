import type { NextApiRequest, NextApiResponse } from 'next'
import { createUser, getUserByEmail } from '@/lib/database'
import { generateToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const code = req.query.code as string
  if (!code) return res.status(400).json({ error: 'Missing code' })

  const tokenRes = await fetch('https://plex.tv/api/v2/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.PLEX_CLIENT_ID,
      client_secret: process.env.PLEX_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.NEXT_PUBLIC_PLEX_REDIRECT_URI,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return res.status(401).json({ error: 'Plex auth failed' })
  }

  const userRes = await fetch('https://plex.tv/api/v2/user', {
    headers: { 'X-Plex-Token': tokenData.access_token },
  })
  const userData = await userRes.json()
  if (!userData.email) {
    return res.status(500).json({ error: 'Failed fetching Plex user' })
  }

  let user = getUserByEmail(userData.email)
  if (!user) {
    user = createUser({
      username: userData.username,
      email: userData.email,
      password_hash: '',
      role: 'user',
      avatar: userData.thumb || null,
      permissions: null,
    })
  }

  const jwt = generateToken(user)
  res.setHeader('Set-Cookie', `token=${jwt}; HttpOnly; Path=/`)
  return res.redirect('/')
}
