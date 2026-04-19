# VPS Setup Guide

## Prerequisites

VPS dengan:

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- Nginx (optional, untuk reverse proxy)
- PM2 (untuk process management)

## Step 1: Connect to VPS

```bash
ssh user@your-vps-ip
```

## Step 2: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v
npm -v
```

## Step 3: Clone Repository

```bash
cd /var/www  # atau folder pilihan kamu
git clone https://github.com/dkzhen/cloudisk-service-node.git
cd cloudisk-service-node
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Setup Environment

```bash
# Copy template
cp .env.example .env

# Edit dengan nano atau vim
nano .env
```

Edit `.env`:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com  # Ganti dengan domain FE kamu
```

Save: `Ctrl+X`, `Y`, `Enter`

## Step 6: Test Run

```bash
npm start
```

Jika jalan, tekan `Ctrl+C` untuk stop.

## Step 7: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start aplikasi dengan PM2
pm2 start index.js --name cloudisk-service

# Auto-start on reboot
pm2 startup
pm2 save
```

## Step 8: PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs cloudisk-service

# Restart
pm2 restart cloudisk-service

# Stop
pm2 stop cloudisk-service

# Delete
pm2 delete cloudisk-service
```

## Step 9: Setup Nginx (Optional)

Install Nginx:

```bash
sudo apt update
sudo apt install nginx -y
```

Create config:

```bash
sudo nano /etc/nginx/sites-available/cloudisk-service
```

Paste config:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Ganti dengan domain kamu

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Increase upload size limit
    client_max_body_size 50M;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/cloudisk-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Setup SSL (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

## Step 11: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 12: Update Code (Future)

```bash
cd /var/www/cloudisk-service-node
git pull
npm install
pm2 restart cloudisk-service
```

## Monitoring

```bash
# CPU & Memory usage
pm2 monit

# Logs
pm2 logs cloudisk-service --lines 100

# Error logs only
pm2 logs cloudisk-service --err
```

## Troubleshooting

### Port already in use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

### Permission denied for storage folder

```bash
cd /var/www/cloudisk-service-node
sudo chown -R $USER:$USER storage
chmod 755 storage
```

### PM2 not starting on reboot

```bash
pm2 unstartup
pm2 startup
pm2 save
```

## Security Checklist

- ✅ Change default SSH port
- ✅ Disable root login
- ✅ Setup firewall (ufw)
- ✅ Use SSL certificate
- ✅ Set proper CORS_ORIGIN in .env
- ✅ Regular updates: `sudo apt update && sudo apt upgrade`

## Quick Commands

```bash
# Start service
pm2 start cloudisk-service

# Stop service
pm2 stop cloudisk-service

# Restart service
pm2 restart cloudisk-service

# View logs
pm2 logs cloudisk-service

# Update code
cd /var/www/cloudisk-service-node && git pull && npm install && pm2 restart cloudisk-service
```

## Access Your Service

- Without Nginx: `http://your-vps-ip:3001`
- With Nginx: `http://api.yourdomain.com`
- With SSL: `https://api.yourdomain.com`

## Done! 🎉

Your CloudDisk File Service is now running on VPS!
