#!/bin/bash
# Webhook receiver script for automated deployments
# Save as: /opt/certificate-generator/deploy-webhook.sh

set -e

echo "🔔 Webhook received at $(date)"

# Navigate to project directory
cd /opt/certificate-generator

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin master

# Pull latest Docker images from GHCR
echo "🐳 Pulling Docker images..."
docker pull ghcr.io/YOUR_USERNAME/certificate-generator-backend:latest
docker pull ghcr.io/YOUR_USERNAME/certificate-generator-frontend:latest

# Update docker-compose to use GHCR images
echo "🔄 Updating containers..."
docker compose pull
docker compose up -d --force-recreate

# Cleanup old images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment complete at $(date)"
