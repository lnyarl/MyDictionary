#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';
EOSQL

echo "PostgreSQL initialization script completed"
