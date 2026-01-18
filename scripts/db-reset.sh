#!/bin/bash
set -e

DB_CONTAINER="stashy-db-dev"
DB_USER="postgres"
DB_NAME="stashy"

echo "=== Stashy Database Reset ==="
echo "Resetting database '$DB_NAME' in container '$DB_CONTAINER'..."

docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF

echo "Database schema wiped."
echo ""

echo "Step 2: Running migrations via migrate.js..."
docker exec -i "$DB_CONTAINER" node /app/backend/scripts/migrate.js

echo ""
echo "=== Database reset and migration complete ==="
