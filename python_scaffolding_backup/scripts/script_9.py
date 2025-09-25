# Create remaining UI components and utilities
def create_remaining_components():
    
    # src/components/ui/label.tsx - Label component
    label_component = '''import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
'''
    
    # src/components/ui/loading-spinner.tsx - Loading spinner
    loading_spinner = '''import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}
'''
    
    # src/components/ui/theme-provider.tsx - Theme provider
    theme_provider = '''export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
'''
    
    # src/components/ui/toast.tsx - Toast notifications
    toast_component = ''''use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

let toastCounter = 0;
const toasts: Toast[] = [];
let setToastsCallback: ((toasts: Toast[]) => void) | null = null;

export function toast(message: string, type: Toast['type'] = 'info', duration = 4000) {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, type, message, duration };
  
  toasts.push(newToast);
  setToastsCallback?.(toasts.slice());
  
  if (duration > 0) {
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        setToastsCallback?.(toasts.slice());
      }
    }, duration);
  }
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  
  setToastsCallback = useCallback((newToasts: Toast[]) => {
    setCurrentToasts(newToasts);
  }, []);

  const removeToast = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      setCurrentToasts(toasts.slice());
    }
  };

  const getToastClasses = (type: Toast['type']) => {
    const base = 'rounded-lg p-4 shadow-lg border';
    const variants = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return cn(base, variants[type]);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.type)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-current hover:opacity-70"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
'''
    
    # src/components/layout/dashboard-sidebar.tsx - Sidebar navigation
    dashboard_sidebar = ''''use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Discover', href: '/discover', icon: '🔍' },
  { name: 'Requests', href: '/requests', icon: '📝' },
  { name: 'Settings', href: '/settings', icon: '⚙️', adminOnly: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:block hidden">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Bookseerr</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''
    
    # src/components/layout/dashboard-header.tsx - Header with user menu
    dashboard_header = ''''use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-foreground">Bookseerr</h1>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Welcome back,</span>
              <span className="font-medium text-foreground">{user?.username}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
'''
    
    # Write remaining components
    remaining_files = [
        ("bookseerr/src/components/ui/label.tsx", label_component),
        ("bookseerr/src/components/ui/loading-spinner.tsx", loading_spinner),
        ("bookseerr/src/components/ui/theme-provider.tsx", theme_provider),
        ("bookseerr/src/components/ui/toast.tsx", toast_component),
        ("bookseerr/src/components/layout/dashboard-sidebar.tsx", dashboard_sidebar),
        ("bookseerr/src/components/layout/dashboard-header.tsx", dashboard_header)
    ]
    
    for file_path, content in remaining_files:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
    
    return "Remaining UI components created"

# Create documentation files
def create_documentation():
    
    # README.md
    readme = '''# Bookseerr

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
'''
    
    # DEPLOYMENT.md
    deployment_guide = '''# Bookseerr Deployment Guide

This guide covers various deployment options for Bookseerr.

## Prerequisites

- Docker and Docker Compose
- (Optional) Reverse proxy (Nginx, Traefik, etc.)
- Readarr instance
- QBittorrent instance

## Docker Deployment (Recommended)

### Quick Start

1. Create a deployment directory:
```bash
mkdir bookseerr
cd bookseerr
```

2. Download docker-compose.yml and .env.example:
```bash
# Download files (replace with actual URLs)
wget https://raw.githubusercontent.com/your-repo/bookseerr/main/docker-compose.yml
wget https://raw.githubusercontent.com/your-repo/bookseerr/main/.env.example
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start services:
```bash
docker-compose up -d
```

### Docker Compose Configuration

#### Basic Setup

```yaml
version: '3.8'

services:
  bookseerr:
    image: bookseerr/bookseerr:latest
    container_name: bookseerr
    environment:
      - JWT_SECRET=your-jwt-secret
      - READARR_URL=http://readarr:8787
      - READARR_API_KEY=your-api-key
      - QBITTORRENT_URL=http://qbittorrent:8080
      - QBITTORRENT_USERNAME=admin
      - QBITTORRENT_PASSWORD=adminpass
    ports:
      - "5055:5055"
    volumes:
      - bookseerr_data:/app/data
    restart: unless-stopped

volumes:
  bookseerr_data:
```

#### With Existing Services

If you already have Readarr and QBittorrent running:

```yaml
version: '3.8'

services:
  bookseerr:
    image: bookseerr/bookseerr:latest
    container_name: bookseerr
    environment:
      - JWT_SECRET=your-jwt-secret
      - READARR_URL=http://your-readarr-ip:8787
      - READARR_API_KEY=your-api-key
      - QBITTORRENT_URL=http://your-qbittorrent-ip:8080
      - QBITTORRENT_USERNAME=admin
      - QBITTORRENT_PASSWORD=adminpass
    ports:
      - "5055:5055"
    volumes:
      - bookseerr_data:/app/data
    restart: unless-stopped
    networks:
      - arr_network  # Connect to existing network

networks:
  arr_network:
    external: true
```

## Unraid Deployment

### Using Community Applications

1. Install "Community Applications" plugin
2. Search for "Bookseerr"
3. Configure template variables
4. Deploy container

### Manual Unraid Setup

1. Go to Docker tab
2. Click "Add Container"
3. Fill in template:
   - Name: `Bookseerr`
   - Repository: `bookseerr/bookseerr:latest`
   - Network Type: `Bridge`
   - Port: `5055:5055`
4. Add environment variables
5. Add volume mapping: `/mnt/user/appdata/bookseerr:/app/data`

## Synology NAS Deployment

### Using Docker Package

1. Install Docker from Package Center
2. Download image: `bookseerr/bookseerr:latest`
3. Create container with settings:
   - Port: `5055:5055`
   - Volume: `docker/bookseerr:/app/data`
   - Environment variables as needed

### Using Synology Container Manager

1. Open Container Manager
2. Go to Registry and search "bookseerr"
3. Download latest image
4. Create container with configuration
5. Start container

## Reverse Proxy Setup

### Nginx

```nginx
server {
    listen 80;
    server_name bookseerr.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bookseerr.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5055;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Traefik

```yaml
version: '3.8'

services:
  bookseerr:
    image: bookseerr/bookseerr:latest
    container_name: bookseerr
    environment:
      - JWT_SECRET=your-jwt-secret
    volumes:
      - bookseerr_data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.bookseerr.rule=Host(\`bookseerr.yourdomain.com\`)"
      - "traefik.http.routers.bookseerr.tls.certresolver=letsencrypt"
      - "traefik.http.services.bookseerr.loadbalancer.server.port=5055"
    networks:
      - traefik
    restart: unless-stopped

volumes:
  bookseerr_data:

networks:
  traefik:
    external: true
```

### Cloudflare Tunnel

```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: bookseerr.yourdomain.com
    service: http://bookseerr:5055
  - service: http_status:404
```

## Environment Variables Reference

### Required
- `JWT_SECRET`: Secret key for JWT tokens (generate a secure random string)

### Optional
- `JWT_EXPIRES_IN`: Token expiration in seconds (default: 3600)
- `DATABASE_URL`: Database connection string (default: sqlite:./bookseerr.db)
- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Application port (default: 5055)

### Integrations
- `READARR_URL`: Readarr server URL
- `READARR_API_KEY`: Readarr API key
- `QBITTORRENT_URL`: QBittorrent Web UI URL
- `QBITTORRENT_USERNAME`: QBittorrent username
- `QBITTORRENT_PASSWORD`: QBittorrent password

## Security Considerations

### JWT Secret
Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### Reverse Proxy
- Always use HTTPS in production
- Configure proper SSL certificates
- Set up fail2ban for brute force protection

### Network Security
- Use Docker networks to isolate services
- Don't expose unnecessary ports
- Configure firewall rules

### Database
- Regular backups of SQLite database
- Consider PostgreSQL for high-traffic deployments

## Monitoring and Logging

### Container Logs
```bash
docker logs bookseerr
docker logs -f bookseerr  # Follow logs
```

### Health Checks
The application includes health check endpoints:
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

### Monitoring Stack
Consider adding:
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation

## Backup and Recovery

### Database Backup
```bash
# Backup SQLite database
docker exec bookseerr cp /app/data/bookseerr.db /app/data/backup-$(date +%Y%m%d).db

# Or from host
cp /path/to/docker/volumes/bookseerr_data/_data/bookseerr.db ./backup.db
```

### Full Backup
```bash
# Backup entire data volume
docker run --rm -v bookseerr_data:/data -v $(pwd):/backup alpine tar czf /backup/bookseerr-backup.tar.gz -C /data .
```

### Restore
```bash
# Restore from backup
docker run --rm -v bookseerr_data:/data -v $(pwd):/backup alpine tar xzf /backup/bookseerr-backup.tar.gz -C /data
```

## Troubleshooting

### Common Issues

1. **Cannot connect to Readarr**
   - Check URL and API key
   - Verify network connectivity
   - Check Readarr logs

2. **Database permission errors**
   - Ensure proper volume permissions
   - Check user ID mappings

3. **Authentication issues**
   - Verify JWT_SECRET is set
   - Check cookie settings
   - Clear browser cache

### Debug Mode
Enable debug logging:
```yaml
environment:
  - NODE_ENV=development
  - DEBUG=bookseerr:*
```

### Container Access
```bash
# Shell into container
docker exec -it bookseerr sh

# Check file permissions
docker exec bookseerr ls -la /app/data
```

## Updates

### Docker Updates
```bash
# Pull latest image
docker pull bookseerr/bookseerr:latest

# Recreate container
docker-compose up -d --force-recreate bookseerr
```

### Database Migrations
Database migrations are handled automatically on startup.

## Performance Tuning

### SQLite Optimization
For high-traffic deployments, consider:
- Using PostgreSQL instead of SQLite
- Enabling WAL mode for SQLite
- Regular VACUUM operations

### Container Resources
```yaml
services:
  bookseerr:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```
'''
    
    # Write documentation files
    with open("bookseerr/README.md", "w") as f:
        f.write(readme)
    
    with open("bookseerr/docs/DEPLOYMENT.md", "w") as f:
        f.write(deployment_guide)
    
    # Create additional files
    additional_files = {
        "bookseerr/.gitignore": '''# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Next.js
.next/
out/

# Production
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Database
*.db
*.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
''',
        
        "bookseerr/LICENSE": '''MIT License

Copyright (c) 2024 Bookseerr

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
''',
        
        "bookseerr/docs/API.md": '''# Bookseerr API Documentation

## Authentication

All API endpoints except `/api/auth/login` and `/api/auth/register` require authentication. Authentication is handled via JWT tokens sent as HTTP-only cookies or Bearer tokens in the Authorization header.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Books API

### Search Books
```http
GET /api/books?query=dune&page=1&limit=20
```

### Get Book Details
```http
GET /api/books/[bookId]
```

### Add Book (Admin Only)
```http
POST /api/books
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "9781234567890",
  "description": "Book description..."
}
```

## Requests API

### List Requests
```http
GET /api/requests?status=pending
```

### Create Request
```http
POST /api/requests
Content-Type: application/json

{
  "bookId": "book_id_here",
  "notes": "Optional request notes"
}
```

### Update Request Status (Admin Only)
```http
PUT /api/requests/[requestId]
Content-Type: application/json

{
  "status": "approved",
  "rejectionReason": "Optional rejection reason"
}
```

For complete API documentation, see the OpenAPI schema at `/api-docs` when running the application.
'''
    }
    
    for file_path, content in additional_files.items():
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
    
    return "Documentation and additional files created"

print(create_remaining_components())
print(create_documentation())