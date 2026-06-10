#!/bin/sh
set -e

if [ ! -f node_modules/.package-lock.hash ] || ! cmp -s package-lock.json node_modules/.package-lock.hash; then
  echo "Installing dependencies..."
  npm ci
  cp package-lock.json node_modules/.package-lock.hash
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec "$@"
