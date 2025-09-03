#!/bin/bash

# CircuitHub Production Deployment Script

echo "🚀 Deploying CircuitHub to Production..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.production .env
    echo "✅ .env file created. Please review and update with production values!"
    exit 1
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose down
docker-compose up -d --build

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U circuithub_user -d circuithub; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose exec -T app npx prisma db push

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec -T app npx prisma generate

# Seed database (only for fresh installations)
echo "🌱 Seeding database..."
docker-compose exec -T app npx tsx packages/db/src/seed.ts

echo "🎉 CircuitHub is deployed!"
echo "📱 Application: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"