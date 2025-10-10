#!/usr/bin/env bash
set -euo pipefail

# cleanup_dumps.sh
# Removes local dump files created during migration.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
find "$ROOT_DIR" -maxdepth 1 -type f \( -name "librarymate*.dump" -o -name "*.sql" \) -print -exec rm -v {} \;

echo "Cleanup complete."
