#!/usr/bin/env bash
set -euo pipefail
file="${1:?file required}"
anchor="${2:?anchor required}"
insert="${3:-}"

# If no insert text provided, read from stdin (but timeout after 1 second)
if [ -z "$insert" ]; then
  if read -t 1 insert; then
    # Got input from stdin
    :
  else
    # No stdin input, use empty string
    insert=""
  fi
fi

# Create backup
cp "$file" "$file.backup.$$" 2>/dev/null || true

# Insert after anchor line
awk -v a="$anchor" -v ins="$insert" '
  {print}
  $0 ~ a {print ins}
' "$file" > "$file.new" && mv "$file.new" "$file"

# Verify insertion worked
if [ -n "$insert" ] && grep -Fq "$insert" "$file"; then
  echo "✅ Inserted '$insert' after anchor: $anchor"
  rm -f "$file.backup.$$"
elif [ -z "$insert" ]; then
  echo "✅ Inserted empty line after anchor: $anchor"
  rm -f "$file.backup.$$"
else
  echo "❌ FAIL: insert not found after $anchor"
  # Restore backup
  mv "$file.backup.$$" "$file" 2>/dev/null || true
  exit 1
fi
