# Bookseerr Deployment Guide

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
