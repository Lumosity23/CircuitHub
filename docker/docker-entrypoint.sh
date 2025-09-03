#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U circuithub_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing command"

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Seed the database (optional)
echo "Seeding database..."
npx tsx packages/db/src/seed.ts

# Start the application
echo "Starting the application..."
exec "$@"