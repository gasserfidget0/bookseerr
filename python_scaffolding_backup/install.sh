#!/bin/bash

# Bookseerr Installation Script
# This script will set up Bookseerr with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   exit 1
fi

print_header "============================================="
print_header "        Bookseerr Installation Script       "
print_header "============================================="

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_status "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

print_status "Prerequisites check passed!"

# Get installation directory
read -p "Enter installation directory [./bookseerr]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-"./bookseerr"}

# Create installation directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

print_status "Installing to: $(pwd)"

# Download docker-compose.yml if not exists
if [ ! -f "docker-compose.yml" ]; then
    print_status "Creating docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

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

volumes:
  bookseerr_data:

networks:
  bookseerr_network:
    driver: bridge
EOF
fi

# Create .env file if not exists
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration..."

    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)

    cat > .env << EOF
# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=3600

# Readarr Integration (Optional)
READARR_URL=
READARR_API_KEY=

# QBittorrent Integration (Optional)
QBITTORRENT_URL=
QBITTORRENT_USERNAME=
QBITTORRENT_PASSWORD=

# Application
NODE_ENV=production
EOF

    print_status "Created .env file with secure JWT secret"
    print_warning "Please edit .env file to configure your Readarr and QBittorrent settings"
fi

# Prompt for configuration
print_header ""
print_header "Configuration Setup"
print_header "==================="

echo "Would you like to configure integrations now? (y/n)"
read -p "Configure now? [y/N]: " CONFIGURE_NOW

if [[ $CONFIGURE_NOW =~ ^[Yy]$ ]]; then
    print_status "Configuring integrations..."

    echo ""
    read -p "Readarr URL (e.g., http://localhost:8787): " READARR_URL
    read -p "Readarr API Key: " READARR_API_KEY

    echo ""
    read -p "QBittorrent URL (e.g., http://localhost:8080): " QBITTORRENT_URL
    read -p "QBittorrent Username: " QBITTORRENT_USERNAME
    read -s -p "QBittorrent Password: " QBITTORRENT_PASSWORD
    echo ""

    # Update .env file
    sed -i "s|READARR_URL=|READARR_URL=${READARR_URL}|g" .env
    sed -i "s|READARR_API_KEY=|READARR_API_KEY=${READARR_API_KEY}|g" .env
    sed -i "s|QBITTORRENT_URL=|QBITTORRENT_URL=${QBITTORRENT_URL}|g" .env
    sed -i "s|QBITTORRENT_USERNAME=|QBITTORRENT_USERNAME=${QBITTORRENT_USERNAME}|g" .env
    sed -i "s|QBITTORRENT_PASSWORD=|QBITTORRENT_PASSWORD=${QBITTORRENT_PASSWORD}|g" .env

    print_status "Configuration updated!"
fi

# Build and start services
print_header ""
print_header "Starting Bookseerr"
print_header "=================="

print_status "Building and starting Bookseerr..."
print_status "This may take a few minutes on first run..."

if docker-compose up -d --build; then
    print_status "Bookseerr started successfully!"
else
    print_error "Failed to start Bookseerr. Check the logs with: docker-compose logs"
    exit 1
fi

# Wait for application to be ready
print_status "Waiting for application to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:5055/api/health >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

print_header ""
print_header "Installation Complete!"
print_header "====================="

print_status "Bookseerr is now running at: http://localhost:5055"
print_status "Default login: admin / admin"
print_warning "Please change the default password after first login!"

print_header ""
print_status "Useful commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo "  Update:       docker-compose pull && docker-compose up -d"

print_header ""
print_status "Next steps:"
echo "1. Open http://localhost:5055 in your browser"
echo "2. Login with admin/admin"
echo "3. Change the default password"
echo "4. Configure Readarr and QBittorrent in Settings"
echo "5. Start requesting books!"

if [ -f ".env" ]; then
    print_warning "Remember to backup your .env file and database!"
fi
