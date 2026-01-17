#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

CONTAINER_NAME="stashy-db-dev"
DB_USER="postgres"
DB_NAME="stashy"

echo "=== Database Reset ==="
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"
echo ""

echo "Step 1: Dropping all tables..."
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF
echo "All tables dropped."
echo ""

echo "Step 2: Running backend migrations..."
for file in $(ls "$PROJECT_ROOT/backend/migrations/"*.sql 2>/dev/null | sort); do
    echo "  Running: $(basename "$file")"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$file" > /dev/null
done
echo "Backend migrations complete."
echo ""

echo "Step 3: Running backend-admin migrations..."
for file in $(ls "$PROJECT_ROOT/backend-admin/migrations/"*.sql 2>/dev/null | sort); do
    echo "  Running: $(basename "$file")"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$file" > /dev/null
done
echo "Backend-admin migrations complete."
echo ""

echo "=== Database reset complete ==="
