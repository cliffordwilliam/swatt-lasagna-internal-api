#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -c '\q' 2>/dev/null; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Running migrations..."
for migration in /app/migrations/*.sql; do
    [ -f "$migration" ] || continue
    echo "Applying: $(basename $migration)"
    if PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -q < "$migration"; then
        echo "$(basename $migration) completed"
    else
        echo "$(basename $migration) failed"
        exit 1
    fi
done

echo "All migrations completed successfully"

if [ -f "/app/seed.sql" ]; then
    echo "Running seed.sql..."
    if PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -q < /app/seed.sql; then
        echo "Seed data loaded successfully"
    else
        echo "Seed data loading failed"
        exit 1
    fi
else
    echo "No seed.sql found, skipping seed"
fi

echo "Starting application..."
exec "$@"