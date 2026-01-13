#!/bin/bash
set -e

# Ensure postgres user password is set correctly
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER USER postgres WITH PASSWORD 'postgres';
EOSQL

echo "PostgreSQL user password has been set successfully"
