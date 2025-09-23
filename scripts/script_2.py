# Create Docker configuration files
def create_docker_files():
    
    # Dockerfile
    dockerfile = '''# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \\
  if [ -f package-lock.json ]; then npm ci; \\
  else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && npm install; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create database directory
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 5055

ENV PORT 5055
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
'''
    
    # docker-compose.yml for production
    docker_compose = '''version: '3.8'

services:
  bookseerr:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bookseerr
    restart: unless-stopped
    ports:
      - "5055:5055"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-3600}
      - DATABASE_URL=sqlite:/app/data/bookseerr.db
      - READARR_URL=${READARR_URL}
      - READARR_API_KEY=${READARR_API_KEY}
      - QBITTORRENT_URL=${QBITTORRENT_URL}
      - QBITTORRENT_USERNAME=${QBITTORRENT_USERNAME}
      - QBITTORRENT_PASSWORD=${QBITTORRENT_PASSWORD}
    volumes:
      - bookseerr_data:/app/data
      - /etc/localtime:/etc/localtime:ro
    networks:
      - bookseerr_network

  # Optional: Include Readarr if not already running
  readarr:
    image: lscr.io/linuxserver/readarr:develop
    container_name: bookseerr_readarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - readarr_config:/config
      - readarr_books:/books
      - readarr_downloads:/downloads
    ports:
      - "8787:8787"
    restart: unless-stopped
    networks:
      - bookseerr_network

  # Optional: Include QBittorrent if not already running  
  qbittorrent:
    image: lscr.io/linuxserver/qbittorrent:latest
    container_name: bookseerr_qbittorrent
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - WEBUI_PORT=8080
    volumes:
      - qbittorrent_config:/config
      - readarr_downloads:/downloads
    ports:
      - "8080:8080"
    restart: unless-stopped
    networks:
      - bookseerr_network

volumes:
  bookseerr_data:
  readarr_config:
  readarr_books:
  readarr_downloads:
  qbittorrent_config:

networks:
  bookseerr_network:
    driver: bridge
'''
    
    # docker-compose.dev.yml for development
    docker_compose_dev = '''version: '3.8'

services:
  bookseerr-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: bookseerr-dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=dev-secret-key
      - JWT_EXPIRES_IN=3600
      - DATABASE_URL=sqlite:/app/data/bookseerr-dev.db
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
      - bookseerr_dev_data:/app/data
    networks:
      - bookseerr_dev_network

volumes:
  bookseerr_dev_data:

networks:
  bookseerr_dev_network:
    driver: bridge
'''
    
    # Dockerfile.dev for development
    dockerfile_dev = '''FROM node:18-alpine

# Install dependencies for better development experience
RUN apk add --no-cache libc6-compat git

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV development

# Start development server
CMD ["npm", "run", "dev"]
'''
    
    # .dockerignore
    dockerignore = '''Dockerfile*
docker-compose*
.dockerignore
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.next
.vscode
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
'''
    
    # Write Docker files
    with open("bookseerr/Dockerfile", "w") as f:
        f.write(dockerfile)
    
    with open("bookseerr/docker-compose.yml", "w") as f:
        f.write(docker_compose)
    
    with open("bookseerr/docker-compose.dev.yml", "w") as f:
        f.write(docker_compose_dev)
    
    with open("bookseerr/Dockerfile.dev", "w") as f:
        f.write(dockerfile_dev)
    
    with open("bookseerr/.dockerignore", "w") as f:
        f.write(dockerignore)
    
    return "Docker configuration files created"

print(create_docker_files())