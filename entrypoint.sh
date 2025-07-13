#!/bin/sh
set -e

PRISMA_DIR="/app/prisma"
PRISMA_BACKUP_DIR="/app/prisma.bak"

# If the prisma directory (volume) is empty, restore from backup.
# This handles the initial startup scenario where a volume is mounted.
if [ -d "$PRISMA_DIR" ] && [ ! "$(ls -A $PRISMA_DIR)" ]; then
  echo "Prisma directory is empty. Restoring from backup..."
  cp -r $PRISMA_BACKUP_DIR/. $PRISMA_DIR/
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
node server.js
