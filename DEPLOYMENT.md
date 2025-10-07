# 🚀 LibraryMate Deployment Guide

## Quick Start (Automated Deployment)

1. **Prerequisites**
   ```bash
   # Install Docker and Docker Compose
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   # Log out and log back in for group changes to take effect
   ```

2. **Configure Environment**
   ```bash
   # Edit .env.production with your settings
   nano .env.production
   ```
   
   **Important**: Update these values in `.env.production`:
   - `POSTGRES_PASSWORD`: Set a strong database password
   - `JWT_SECRET`: Generate a secure JWT secret (32+ characters)
   - `EMAIL_USER` & `EMAIL_PASSWORD`: Your Gmail credentials
   - `FRONTEND_URL`: Your actual domain (if deploying to production)

3. **Deploy Everything**
   ```bash
   ./deploy.sh
   ```

## Manual Deployment Steps

If you prefer manual deployment:

### Step 1: Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 2: Start Services
```bash
# Stop any existing containers
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 3: Initialize Database
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial data (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## Access Your Application

- **Frontend**: http://localhost (or https://localhost for SSL)
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs
- **Database**: localhost:5432

## Monitoring & Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f nginx

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

## Production Deployment (VPS/Cloud)

### Domain Setup
1. Update `nginx.conf` - replace `your-domain.com` with your actual domain
2. Update `.env.production` - set `FRONTEND_URL` to your domain
3. Update `frontend/.env.production` - set API URLs to your domain

### SSL Certificates
Replace self-signed certificates with real ones:
```bash
# Using Let's Encrypt (recommended)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Or manually place certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

### Firewall Configuration
```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## Backup & Maintenance

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U librarymate_user librarymate > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U librarymate_user librarymate < backup.sql
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 443, 4000, and 5432 are available
2. **Permission issues**: Ensure upload directory has correct permissions
3. **Email not working**: Check Gmail app password setup
4. **Database connection fails**: Verify database credentials in .env.production

### Useful Commands
```bash
# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Enter container shell
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec postgres psql -U librarymate_user librarymate

# Check container health
docker-compose -f docker-compose.prod.yml ps
```

## Security Checklist

- [ ] Change default passwords in `.env.production`
- [ ] Use strong JWT secret
- [ ] Configure proper SSL certificates
- [ ] Set up firewall rules
- [ ] Enable Docker security options
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity