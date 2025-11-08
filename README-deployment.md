# Wizza Deployment Guide

Complete guide for deploying Wizza to production and development environments.

## 🚀 Production Deployment (Ubuntu Server: 95.111.239.53)

### Prerequisites

- Ubuntu 20.04+ server with root access
- Domain/IP: 95.111.239.53
- Minimum 2GB RAM, 20GB storage
- SSH access to the server

### Step 1: Initial Server Setup

1. **Connect to your server:**

   ```bash
   ssh root@95.111.239.53
   ```

2. **Run the server setup script:**

   ```bash
   # Upload and run server-setup.sh
   wget https://your-repo/server-setup.sh
   chmod +x server-setup.sh
   sudo ./server-setup.sh
   ```

   This script will:
   - Update system packages
   - Install Node.js 20, pnpm, PM2
   - Install Docker and Docker Compose
   - Install and configure Nginx
   - Set up firewall (UFW)
   - Create application user and directories
   - Configure system optimizations

### Step 2: Upload Application Files

1. **Switch to the wizza user:**

   ```bash
   sudo su - wizza
   cd /var/www/wizza
   ```

2. **Clone or upload your application:**

   ```bash
   # Option 1: Clone from repository
   git clone https://your-repo/wizza.git .
   
   # Option 2: Upload files via SCP (from your local machine)
   scp -r /path/to/your/wizza/* wizza@95.111.239.53:/var/www/wizza/
   ```

3. **Copy environment configuration:**

   ```bash
   cp .env.production .env
   ```

### Step 3: Configure Environment Variables

Edit the `.env` file with your production values:

```bash
nano .env
```

**Required configurations:**

- Database URLs (PostgreSQL)
- Supabase credentials
- Stripe API keys (live)
- NextAuth secret
- CORS origins

### Step 4: Deploy Application

1. **Run the production deployment script:**

   ```bash
   chmod +x production-deploy.sh
   ./production-deploy.sh
   ```

   This script will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build the application
   - Start with PM2
   - Configure Nginx
   - Perform health checks

### Step 5: Set Up SSL Certificate

```bash
sudo certbot --nginx -d 95.111.239.53
```

### Step 6: Verify Deployment

1. **Check application status:**

   ```bash
   pm2 status
   pm2 logs wizza
   ```

2. **Test the application:**

   ```bash
   curl http://95.111.239.53/health
   curl https://95.111.239.53
   ```

## 🛠️ Development Environment

### Development Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database
- Git

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://your-repo/wizza.git
   cd wizza
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.local .env
   # Edit .env with your development values
   ```

4. **Set up database:**

   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

5. **Start development server:**

   ```bash
   pnpm dev
   ```

## 🐳 Docker Deployment (Alternative)

### Development with Docker

```bash
# Start development environment
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production with Docker

```bash
# Build and start production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale the application
docker compose up -d --scale app=3
```

## 📊 Monitoring and Maintenance

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs wizza

# Restart application
pm2 restart wizza

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/wizza_*.log
```

### Database Management

```bash
# Run migrations
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset

# View database
pnpm prisma studio
```

### Backup and Restore

```bash
# Create backup
/usr/local/bin/wizza-backup

# List backups
ls -la /var/backups/wizza/

# Restore from backup
tar -xzf /var/backups/wizza/wizza_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/wizza/
```

## 🔧 Troubleshooting

### Common Issues

1. **Application won't start:**

   ```bash
   pm2 logs wizza
   pm2 restart wizza
   ```

2. **Database connection issues:**

   ```bash
   # Check environment variables
   cat .env | grep DATABASE
   
   # Test database connection
   pnpm prisma db pull
   ```

3. **Nginx configuration errors:**

   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Port conflicts:**

   ```bash
   netstat -tlnp | grep :3000
   sudo lsof -i :3000
   ```

### Performance Optimization

1. **Enable HTTP/2:**

   ```nginx
   listen 443 ssl http2;
   ```

2. **Configure caching:**

   ```nginx
   location /_next/static/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Database optimization:**

   ```bash
   # Analyze slow queries
   pnpm prisma studio
   ```

## 🔐 Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Firewall (UFW) enabled and configured
- [ ] Strong passwords and SSH key authentication
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## 📝 Environment Variables Reference

### Production (.env.production)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://95.111.239.53
DATABASE_URL=postgresql://user:password@localhost:5432/wizza_prod
# ... other production variables
```

### Development (.env.local)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/wizza_dev
# ... other development variables
```

## 🚨 Emergency Procedures

### Rollback Deployment

```bash
# Stop current application
pm2 stop wizza

# Restore from backup
cd /var/www/wizza
sudo tar -xzf /var/backups/wizza/pre_deploy_backup_LATEST.tar.gz

# Restart application
pm2 start wizza
```

### Database Recovery

```bash
# Restore database from backup
pg_restore -d wizza_prod /var/backups/wizza/db_backup_LATEST.sql
```

## 📞 Support

For deployment issues or questions:

- Check logs: `pm2 logs wizza`
- Review Nginx logs: `sudo tail -f /var/log/nginx/wizza_error.log`
- Monitor system resources: `htop`
- Check disk space: `df -h`

---

**Last Updated:** $(date)
**Server IP:** 95.111.239.53
**Application:** Wizza Next.js Application
