# Bookseerr Quick Start Guide

Get Bookseerr up and running in just a few minutes!

## One-Line Installation

```bash
curl -sSL https://raw.githubusercontent.com/your-repo/bookseerr/main/scripts/install.sh | bash
```

## Manual Installation

### Step 1: Download
```bash
git clone https://github.com/your-repo/bookseerr.git
cd bookseerr
```

### Step 2: Configure
```bash
cp .env.example .env
# Edit .env with your settings
```

### Step 3: Run
```bash
docker-compose up -d
```

### Step 4: Access
Open http://localhost:5055 and login with:
- Username: `admin`
- Password: `admin`

## First Steps After Installation

1. **Change Default Password**
   - Go to Settings → Users
   - Change admin password

2. **Configure Readarr** (Optional)
   - Go to Settings → Integrations → Readarr
   - Enter your Readarr URL and API key
   - Test connection

3. **Configure QBittorrent** (Optional)
   - Go to Settings → Integrations → QBittorrent  
   - Enter Web UI URL and credentials
   - Test connection

4. **Start Using**
   - Go to Discover to search for books
   - Click "Request" on books you want
   - Admins can approve requests in the Requests section

## Common Issues

**Can't connect to integrations?**
- Ensure Readarr/QBittorrent are accessible from Docker container
- Use container names if services are in the same Docker network
- Check API keys and credentials

**Database errors?**
- Ensure volume has proper permissions
- Check Docker volume mounting

**Login issues?**
- Clear browser cache
- Check if JWT_SECRET is set in .env

## Getting Help

- Check the full documentation in `README.md`
- View deployment guide in `docs/DEPLOYMENT.md`
- Check API documentation in `docs/API.md`

---

🎉 Welcome to Bookseerr! Happy reading! 📚
