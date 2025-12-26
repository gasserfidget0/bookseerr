# Bookseerr - Portainer Deployment Guide

**Status**: ✅ Production Ready  
**Updated**: December 26, 2025

---

## 🎯 QUICK PORTAINER DEPLOYMENT (10 MINUTES)

### Prerequisites
- Portainer running and accessible
- Docker socket available
- Access to your Portainer instance

---

## 📋 METHOD 1: STACK DEPLOYMENT (RECOMMENDED)

This is the easiest and most managed approach.

### Step 1: Access Portainer
1. Open Portainer in your browser (e.g., `http://192.168.1.100:9000`)
2. Select your **Environment** (usually "local")
3. Go to **Stacks** in the left sidebar
4. Click **Add Stack**

### Step 2: Create the Stack

**Name**: `bookseerr`

**Paste this Docker Compose:**

```yaml
version: '3.8'

services:
  bookseerr:
    image: node:18-alpine
    container_name: bookseerr
    restart: unless-stopped
    ports:
      - "5055:3000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 3600
      DATABASE_URL: sqlite:./data/bookseerr.db
      READARR_URL: ${READARR_URL}
      READARR_API_KEY: ${READARR_API_KEY}
      QBITTORRENT_URL: ${QBITTORRENT_URL:-}
      QBITTORRENT_USERNAME: ${QBITTORRENT_USERNAME:-}
      QBITTORRENT_PASSWORD: ${QBITTORRENT_PASSWORD:-}
      GOOGLE_BOOKS_API_KEY: ${GOOGLE_BOOKS_API_KEY:-}
      PORT: 3000
    volumes:
      - bookseerr_data:/app/data
      - /etc/localtime:/etc/localtime:ro
    networks:
      - proxy_default
    working_dir: /app
    command: >
      sh -c "npm install && npm run build && npm start"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  bookseerr_data:
    driver: local

networks:
  proxy_default:
    external: true
```

### Step 3: Add Environment Variables

In the **Environment variables** section, add:

```
JWT_SECRET=your-super-secure-random-key-here-change-this-to-something-random
READARR_URL=http://readarr:8787
READARR_API_KEY=your-readarr-api-key-here
QBITTORRENT_URL=http://qbittorrent:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminpass
GOOGLE_BOOKS_API_KEY=your-google-books-api-key-optional
```

**Important**: 
- Generate a secure JWT_SECRET with: `openssl rand -base64 32`
- Replace `your-readarr-api-key-here` with actual key
- Use container names (not IPs) if services are in same Docker network

### Step 4: Deploy

1. Click **Deploy the stack**
2. Wait for "Stack deployed successfully"
3. Open Bookseerr at `http://localhost:5055`
4. Login with `admin` / `admin`

---

## 🏗️ METHOD 2: BUILD FROM GITHUB (ADVANCED)

For always-latest code:

### Step 1: Clone Repository

```bash
# SSH into your host
ssh user@your-docker-host

# Clone the repo
git clone https://github.com/gasserfidget0/bookseerr.git
cd bookseerr

# Copy example env
cp .env.example .env
```

### Step 2: Configure .env

```bash
nano .env
```

Set these values:
```env
JWT_SECRET=your-secure-key-here
READARR_URL=http://readarr:8787
READARR_API_KEY=your-api-key
```

### Step 3: Create Custom Image (Optional)

In Portainer, go to **Images** → **Build Image**:

**Name**: `bookseerr:latest`

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g npm
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["npm", "start"]
```

### Step 4: Deploy Stack with Custom Image

Same stack config, but change image line:

```yaml
services:
  bookseerr:
    image: bookseerr:latest  # Your custom image
    # ... rest of config ...
```

---

## 🔧 PORTAINER CONFIGURATION TIPS

### Mount Repository Files

To use repository files directly:

```yaml
services:
  bookseerr:
    # ...
    volumes:
      - /path/to/bookseerr:/app  # Bind mount entire repo
      - bookseerr_data:/app/data
```

### Use Portainer Edge Agent (Multiple Hosts)

If you have multiple Docker hosts:

1. Go to **Environments** → **Add Environment**
2. Choose **Docker Standalone**
3. Select **Edge Agent**
4. Deploy stack to specific environment

### Environment Variables in Portainer

**Two ways**:

1. **Stack Level** (recommended):
   - Add in **Environment variables** section when creating stack
   - Portainer injects them automatically

2. **File Level**:
   - Create `.env` file first
   - Mount it in volumes:
   ```yaml
   volumes:
     - /etc/bookseerr/.env:/app/.env:ro
   ```

---

## 🔐 SECURITY IN PORTAINER

### Using Secrets (Production)

Portainer can manage secrets securely:

```yaml
services:
  bookseerr:
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      # ...
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    external: true  # Create in Portainer > Secrets
```

**In Portainer**:
1. Go to **Secrets**
2. Click **Create secret**
3. Name: `jwt_secret`
4. Paste secure random value
5. Reference in stack

### Network Isolation

Create isolated network:

```yaml
networks:
  bookseerr_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.30.0.0/24
```

Only expose necessary ports:

```yaml
ports:
  - "127.0.0.1:5055:3000"  # Local only
```

---

## 📊 MONITORING IN PORTAINER

### Health Checks

Portainer automatically monitors:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### View Logs

**In Portainer UI**:
1. Go to **Containers**
2. Click **bookseerr** container
3. View **Logs** tab in real-time
4. Filter by timestamp or keyword

### Resource Usage

**Monitor stats**:
1. Go to **Dashboard**
2. See CPU, Memory, Network
3. Limits can be set in stack:

```yaml
services:
  bookseerr:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## 🔄 UPDATES IN PORTAINER

### Update Image

**For official images**:
1. Go to **Images**
2. Click **Pull** next to image
3. Select image, pull latest
4. Go to stack → **Pull latest images** → **Update stack**

**For custom builds**:
1. Go to **Images** → **Build Image**
2. Rebuild with latest code
3. Update stack to use new image version

### Recreate Container

1. Go to **Stacks** → **bookseerr**
2. Click **Update the stack**
3. Make changes (if any)
4. Click **Update**
5. Portainer recreates container

### Backup Data

**In Portainer**:
1. Go to **Volumes**
2. Click **bookseerr_data**
3. See mount path (e.g., `/var/lib/docker/volumes/bookseerr_data/_data`)

**Backup command**:
```bash
docker run --rm -v bookseerr_data:/data -v /backup:/backup \
  busybox tar czf /backup/bookseerr-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 🐛 TROUBLESHOOTING IN PORTAINER

### Container Won't Start

1. Check **Logs** tab
2. Common issues:
   - `Cannot find module`: Missing npm install
   - `Port already in use`: Change port mapping
   - `Permission denied`: Check volume permissions

### Can't Connect to Readarr

1. **Check network**:
   - Are both in same Docker network?
   - Use container name, not IP

2. **Test connection**:
   ```bash
   docker exec bookseerr curl http://readarr:8787/api/v1/health
   ```

3. **Check API key**:
   - Verify in Portainer environment variables
   - Make sure it's correct in Readarr

### Database Locked

1. Go to **Containers**
2. Stop **bookseerr**
3. Delete container (NOT volume)
4. Restart from **Stacks**

### Memory Usage Too High

1. Set memory limits in stack
2. Monitor with Portainer dashboard
3. Consider Node.js memory flag:
   ```yaml
   environment:
     NODE_OPTIONS: --max-old-space-size=256
   ```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Created stack in Portainer
- [ ] Set JWT_SECRET to secure value
- [ ] Configured READARR_URL and API key
- [ ] Stack deployed successfully
- [ ] Accessed http://localhost:5055
- [ ] Logged in with admin/admin
- [ ] Changed admin password
- [ ] Verified Readarr connection
- [ ] Synced library from admin panel
- [ ] Created test user
- [ ] Tested request workflow
- [ ] Backed up database volume

---

## 🎯 ADVANCED PORTAINER SETUPS

### With Reverse Proxy (Traefik)

If using Traefik:

```yaml
services:
  bookseerr:
    # ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.bookseerr.rule=Host(`books.yourdomain.com`)"
      - "traefik.http.services.bookseerr.loadbalancer.server.port=3000"
      - "traefik.http.routers.bookseerr.entrypoints=websecure"
      - "traefik.http.routers.bookseerr.tls.certresolver=letsencrypt"
```

### With PostgreSQL (Future)

When ready to upgrade from SQLite:

```yaml
services:
  bookseerr:
    # ...
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/bookseerr
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bookseerr
      POSTGRES_USER: bookseerr
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bookseerr"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 🚀 POST-DEPLOYMENT STEPS

1. **Monitor for 24 hours**
   - Check logs for errors
   - Monitor resource usage
   - Test request workflow

2. **Set up backups**
   - Schedule daily volume backups
   - Store in secure location
   - Test restore procedure

3. **Configure firewall**
   - Only expose 5055 internally
   - Use VPN for external access
   - Enable HTTPS with reverse proxy

4. **Enable notifications**
   - Portainer can alert on container issues
   - Set up email notifications
   - Test notification delivery

---

## 💡 PORTAINER TIPS

- **Use Stacks, not individual containers** - Easier to manage and update
- **Set restart policy** - `unless-stopped` keeps service running
- **Use health checks** - Helps Portainer detect issues
- **Label everything** - Makes finding resources easier
- **Regular backups** - Always backup volumes
- **Monitor resources** - Set limits to prevent runaway containers

---

## 🎉 DONE!

Your Bookseerr is now running in Portainer! You can:

✅ Monitor container status in real-time  
✅ View logs from Portainer UI  
✅ Update and manage easily  
✅ Scale resources as needed  
✅ Backup data securely  

For questions, check container logs in Portainer or refer to the main [setup-guide.md](./setup-guide.md).

Happy reading! 📚
