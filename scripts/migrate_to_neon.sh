#!/usr/bin/env bash
set -euo pipefail

# migrate_to_neon.sh
# Usage: set environment variables below (or source a .env file) before running.
# This script creates a local pg_dump (custom format), prepares the Neon target by
# dropping and recreating the public schema, restores the dump to Neon, then
# optionally removes the local dump file.

# Required environment variables:
# LOCAL_PG_URL  - connection string for the local Postgres (example: postgresql://user:pass@localhost:5433/dbname)
# NEON_PG_URL   - full Neon connection string (example: postgresql://user:pass@host:port/dbname?sslmode=require)
# DUMPFILE      - (optional) path to the dump file created (default: ./librarymate_migrate.dump)

DUMPFILE=${DUMPFILE:-"$(pwd)/librarymate_migrate.dump"}

if [ -z "${LOCAL_PG_URL:-}" ] || [ -z "${NEON_PG_URL:-}" ]; then
  echo "Error: LOCAL_PG_URL and NEON_PG_URL must be set."
  echo "Example:"
  echo "  export LOCAL_PG_URL='postgresql://librarymate_user:password@localhost:5433/librarymate'"
  echo "  export NEON_PG_URL='postgresql://neon_user:password@host:port/neondb?sslmode=require'"
  exit 1
fi

echo "1/5 Creating custom-format dump -> $DUMPFILE"
# Use pg_dump custom format (-Fc)
PGPASSWORD="$(echo "$LOCAL_PG_URL" | sed -n "s#.*://[^:]*:\([^@]*\)@.*#\1#p")" || true
# We won't try to extract password automatically; prefer using PGPASSWORD env or embedded URL
pg_dump -Fc "$LOCAL_PG_URL" -f "$DUMPFILE"

echo "2/5 Preparing Neon target (drop + recreate public schema)."
# Drop and recreate public schema on Neon
psql "$NEON_PG_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "3/5 Restoring dump to Neon (this may take a while)."
# Restore (allow pg_restore to skip owner/acl statements that may fail)
pg_restore --no-owner --no-acl -v -d "$NEON_PG_URL" "$DUMPFILE"

echo "4/5 Verifying counts on Neon (top-level tables)."
psql "$NEON_PG_URL" -c "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"

echo "5/5 Optional cleanup: removing local dump file $DUMPFILE"
if [ "${CLEANUP:-1}" -eq 1 ]; then
  rm -f "$DUMPFILE"
  echo "Removed $DUMPFILE"
else
  echo "Left $DUMPFILE in place (CLEANUP=$CLEANUP)."
fi

echo "Done. Remember to rotate any DB credentials you exposed during migration."
