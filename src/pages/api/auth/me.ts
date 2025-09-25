import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import { getUserById } from '@/lib/database'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).end()
  const token = req.cookies.token || null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const user = getUserById(payload.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.status(200).json({ success: true, data: { user } })
}
