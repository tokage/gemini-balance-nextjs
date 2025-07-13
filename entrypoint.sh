#!/bin/sh
set -e

# Run database migrations
# echo "Running database migrations..."
# npx prisma migrate deploy --schema=/app/prisma/schema.prisma

# Start the application
echo "Starting application..."
npx next start
