# Bookseerr

A modern book request management system inspired by Overseerr, built specifically for managing book requests with Readarr and download clients like QBittorrent.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with role-based permissions
- 📚 **Book Discovery** - Search and browse books with rich metadata
- 🎯 **Request Management** - Submit, approve, and track book requests
- ⚡ **Readarr Integration** - Seamless integration with Readarr for automated book management
- 💾 **QBittorrent Support** - Direct integration with QBittorrent for download management
- 👥 **User Management** - Admin controls for managing users and permissions
- 🎨 **Modern UI** - Clean, responsive interface matching Overseerr's design philosophy
- 🐳 **Docker Ready** - Complete Docker setup for easy deployment

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd bookseerr
```

2. Copy the environment file and configure:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access Bookseerr at `http://localhost:5055`

Default login: `admin / admin`

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time (seconds) | `3600` |
| `DATABASE_URL` | SQLite database path | `sqlite:./bookseerr.db` |
| `READARR_URL` | Readarr server URL | - |
| `READARR_API_KEY` | Readarr API key | - |
| `QBITTORRENT_URL` | QBittorrent Web UI URL | - |
| `QBITTORRENT_USERNAME` | QBittorrent username | - |
| `QBITTORRENT_PASSWORD` | QBittorrent password | - |

### Integrations

#### Readarr Setup

1. Go to Settings → Integrations
2. Configure Readarr connection:
   - URL: Your Readarr instance URL
   - API Key: Found in Readarr Settings → General → Security
   - Root Folder: Where books should be stored
   - Quality Profile: Default quality profile for downloads

#### QBittorrent Setup

1. Enable Web UI in QBittorrent preferences
2. Configure in Bookseerr Settings:
   - URL: QBittorrent Web UI URL (usually http://localhost:8080)
   - Username/Password: QBittorrent Web UI credentials

## Architecture

Bookseerr is built with:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with SQLite database
- **Authentication**: JWT tokens with HTTP-only cookies
- **State Management**: TanStack Query for server state
- **Database**: SQLite (easily replaceable with PostgreSQL)

### Project Structure

```
bookseerr/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── api/            # API routes
│   │   ├── (auth)/         # Authentication pages
│   │   └── (dashboard)/    # Dashboard pages
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript type definitions
├── docker/                # Docker configuration
├── docs/                  # Documentation
└── config/               # Configuration files
```

## API Documentation

The application provides a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Books
- `GET /api/books` - Search and list books
- `POST /api/books` - Add new book (admin only)
- `GET /api/books/[id]` - Get book details
- `PUT /api/books/[id]` - Update book (admin only)

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create new request
- `GET /api/requests/[id]` - Get request details
- `PUT /api/requests/[id]` - Update request status (admin only)

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings (admin only)

### Integrations
- `POST /api/integrations/readarr/test` - Test Readarr connection
- `POST /api/integrations/qbittorrent/test` - Test QBittorrent connection

## Docker Deployment

### Production Deployment

1. Use the provided `docker-compose.yml`:
```bash
docker-compose up -d
```

2. The application will be available at `http://localhost:5055`

### Development with Docker

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Environment Variables in Docker

Create a `.env` file with your configuration:

```env
JWT_SECRET=your-secure-jwt-secret
READARR_URL=http://readarr:8787
READARR_API_KEY=your-readarr-api-key
QBITTORRENT_URL=http://qbittorrent:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminpass
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Overseerr](https://overseerr.dev/)
- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [Radix UI](https://radix-ui.com/)
- Icons from [Heroicons](https://heroicons.com/)

## Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/)
2. Search existing issues
3. Create a new issue with detailed information

---

**Bookseerr** - Making book request management as easy as movie requests! 📚
