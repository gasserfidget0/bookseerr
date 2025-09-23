/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3600',
    DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./bookseerr.db',
    READARR_URL: process.env.READARR_URL,
    READARR_API_KEY: process.env.READARR_API_KEY,
    QBITTORRENT_URL: process.env.QBITTORRENT_URL,
    QBITTORRENT_USERNAME: process.env.QBITTORRENT_USERNAME,
    QBITTORRENT_PASSWORD: process.env.QBITTORRENT_PASSWORD,
  },
  images: {
    domains: ['books.google.com', 'covers.openlibrary.org'],
  },
}

module.exports = nextConfig
