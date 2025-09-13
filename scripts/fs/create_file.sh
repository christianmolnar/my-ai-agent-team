#!/usr/bin/env bash
set -euo pipefail
file="${1:?path required}"
content="${2:-}"

# Create directory if it doesn't exist
mkdir -p "$(dirname "$file")"

# Create file with content (empty if no content provided)
echo "$content" > "$file"

if [ -f "$file" ]; then
  echo "✅ Created $file ($(wc -c <"$file") bytes)"
else
  echo "❌ FAIL: $file was not created" >&2
  exit 1
fi
