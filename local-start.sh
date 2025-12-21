#!/usr/bin/env bash
set -euo pipefail

APP_PID=""

cleanup() {
    kill "${APP_PID:-}" 2>/dev/null || true
    echo "Purging all running containers..."
    docker compose down -v
}
trap cleanup EXIT

echo "Removing old JS build..."
rm -rf dist

echo "Drizzle dev cli generating raw sql files..."
npx drizzle-kit generate

echo "Running containers with docker compose up..."
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec swatt-lasagna-internal-api-postgres-1 pg_isready -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: PostgreSQL failed to become ready after 30 attempts"
        exit 1
    fi
    echo "PostgreSQL is unavailable - sleeping (attempt $i/30)"
    sleep 1
done

echo "Running migrations..."
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying: $migration"
        if docker exec -i swatt-lasagna-internal-api-postgres-1 \
            psql -U postgres -d postgres -q < "$migration"; then
            echo "$migration completed"
        else
            echo "$migration failed"
            exit 1
        fi
    fi
done
echo "All migrations completed successfully"

echo "Running seed.sql..."
if docker exec -i swatt-lasagna-internal-api-postgres-1 psql -U postgres -d postgres -q < seed.sql; then
    echo "Seed data loaded successfully"
else
    echo "Seed data loading failed"
    exit 1
fi

npm run build && npm run start &
APP_PID=$!
echo "JS app is built and is running on http://localhost:3000"
wait $APP_PID