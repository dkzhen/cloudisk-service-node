#!/bin/bash

# Deploy script for Cloudisk Service
# Usage: ./deploy.sh

set -e

APP_NAME="cloudisk-service"
LOG_FILE="/var/log/cloudisk-deploy.log"

echo "🚀 Starting Cloudisk deployment..."

# Git pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Restart PM2 process
echo "♻️ Restarting PM2 process: $APP_NAME..."
pm2 restart "$APP_NAME"

echo "✅ Deployment finished!"
echo "📊 PM2 status:"
pm2 status "$APP_NAME"
