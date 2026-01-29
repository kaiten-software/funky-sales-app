# 🚀 Deployment Guide

## Production Deployment Checklist

### 🔒 Security Hardening

#### 1. Environment Variables
```bash
# Update .env for production
NODE_ENV=production
JWT_SECRET=<generate-strong-random-secret>
DB_PASSWORD=<strong-database-password>
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Database Security
```sql
-- Create dedicated database user
CREATE USER 'pos_app'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON pos_sales_tracker.* TO 'pos_app'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Update Production Settings
- Change all default passwords
- Remove demo users or change their passwords
- Update JWT_SECRET
- Enable HTTPS
- Configure CORS for specific domains
- Set up database backups

### 📦 Build for Production

```bash
# Build frontend
npm run build

# This creates a 'dist' folder with optimized files
```

### 🖥️ Server Setup Options

## Option 1: Traditional Server (Ubuntu/Debian)

### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd jatin-accounting-software

# Install dependencies
npm install --production

# Setup database
mysql -u root -p < server/database/schema.sql

# Configure environment
cp .env.example .env
nano .env  # Update with production values

# Build frontend
npm run build

# Start backend with PM2
pm2 start server/index.js --name pos-sales-tracker
pm2 save
pm2 startup
```

### Configure Nginx

Create `/etc/nginx/sites-available/pos-sales-tracker`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/jatin-accounting-software/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads {
        alias /path/to/jatin-accounting-software/server/uploads;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/pos-sales-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Option 2: Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server/index.js"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: pos_sales_tracker
    volumes:
      - db_data:/var/lib/mysql
      - ./server/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=pos_sales_tracker
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./server/uploads:/app/server/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  db_data:
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Option 3: Cloud Platforms

### Heroku

1. Create `Procfile`:
```
web: node server/index.js
```

2. Deploy:
```bash
heroku create your-app-name
heroku addons:create jawsdb:kitefin  # MySQL addon
git push heroku main
```

### AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Follow "Traditional Server" setup
3. Configure security groups (ports 80, 443, 22)
4. Set up Elastic IP
5. Configure Route 53 for domain

### DigitalOcean

1. Create Droplet (Ubuntu)
2. Follow "Traditional Server" setup
3. Configure firewall
4. Set up domain in DNS

### Vercel (Frontend) + Separate Backend

Frontend (Vercel):
```bash
vercel --prod
```

Backend (Railway/Render):
```bash
# Deploy to Railway or Render
# Update API base URL in frontend
```

## 🔄 Database Backup

### Automated Backup Script

Create `/usr/local/bin/backup-pos-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pos-sales"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u root -p${DB_PASSWORD} pos_sales_tracker > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Setup Cron Job
```bash
sudo chmod +x /usr/local/bin/backup-pos-db.sh
sudo crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-pos-db.sh
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs pos-sales-tracker

# Restart on changes
pm2 restart pos-sales-tracker
```

### Setup PM2 Web Dashboard
```bash
pm2 install pm2-server-monit
```

### Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔍 Health Checks

### Create Health Check Endpoint
Already available at: `GET /api/health`

### Setup Monitoring Service
- Use UptimeRobot, Pingdom, or StatusCake
- Monitor: `https://your-domain.com/api/health`
- Set up alerts for downtime

## 🚀 Performance Optimization

### Frontend
```bash
# Already optimized with Vite build
# Includes:
# - Code splitting
# - Minification
# - Tree shaking
# - Asset optimization
```

### Backend
```javascript
// Add compression middleware
npm install compression

// In server/index.js
import compression from 'compression';
app.use(compression());
```

### Database
```sql
-- Add indexes (already included in schema)
-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Nginx Caching
```nginx
# Add to nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔐 SSL/TLS Configuration

### Let's Encrypt (Free)
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Manual SSL Certificate
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

## 📱 Post-Deployment Checklist

- [ ] Database is set up and populated
- [ ] Environment variables are configured
- [ ] SSL certificate is installed
- [ ] Firewall is configured
- [ ] Backups are automated
- [ ] Monitoring is set up
- [ ] Domain is pointed correctly
- [ ] Email notifications are configured
- [ ] Demo users are removed/updated
- [ ] Default passwords are changed
- [ ] CORS is configured for production domain
- [ ] File upload limits are set
- [ ] Error logging is enabled
- [ ] Performance monitoring is active

## 🆘 Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs pos-sales-tracker

# Check port availability
sudo netstat -tulpn | grep 5000

# Check environment variables
pm2 env 0
```

### Database Connection Issues
```bash
# Test connection
mysql -u pos_app -p pos_sales_tracker

# Check grants
SHOW GRANTS FOR 'pos_app'@'localhost';
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Support

For production issues:
1. Check application logs: `pm2 logs`
2. Check Nginx logs: `/var/log/nginx/`
3. Check database logs: `/var/log/mysql/`
4. Review error messages
5. Check server resources: `htop`

## 🎉 Deployment Complete!

Your POS Sales Tracker is now live and ready for production use!

**Remember to:**
- Monitor regularly
- Keep backups
- Update dependencies
- Review security
- Scale as needed

---

**Happy Deploying! 🚀**
